
export const enum CharCodes {
  LEFT_CURLY_BRACE = 0x7B,    // {
  RIGHT_CURLY_BRACE = 0x7D,   // }
  SINGLE_QUOTE = 0x27,        // '
  DOUBLE_QUOTE = 0x22,        // "
  BACK_QUOTE = 0x60,          // `
  BACK_SLASH = 0x5C,          // \
  SLASH = 0x2F,               // /
  LESS_THAN = 0x3C,           // <
  GREATER_THAN = 0x3E,        // <

  TAB = 0x09,                 // \t
  LINE_FEED = 0x0A,           // \n
  CARRIAGE_RETURN = 0x0D,     // \r
  SPACE = 0x0020,             // " "
}

class TranslationStatement {
  constructor(
    public start: number = 0,
    public end: number = 0,
    public statement: string = '',
  ) {}
}

/**
 * Notes:
 * 1. should ignore <wxs></wxs> tag, since it may contains double curly braces
 *    which is obviously not what we want.
 * 2. should ignore single {} and double {{}} when already in translation block.
 *    e.g. JavaScript nested blocks or object decls or double for loop and things like that.
 * 3. should identify function calls inside translation block ({{ t() }}) and sent it to transfomer afterwards.
 *    Note: should ignore object method decls e.g. {{ t.k() }}, function decls is not supported inside block.
 */

/**
 * TranslationBlockParser is responsible for parsing translation block in xwml file
 */
export class TranslationBlockParser  {
  private pos: number = 0
  private blockStart: number = -1
  private _blockCount: number = 0
  private statements: TranslationStatement[] = []

  constructor(
    public source: string,
  ) { }

  parse() {
    while (!this.eof()) this._parse()
    return this.statements
  }

  _parse() {
    if (this.match(CharCodes.LEFT_CURLY_BRACE)) {
      this.advance()
      // start block {{
      if (this.match(CharCodes.LEFT_CURLY_BRACE)) {
        this.advance()
        this.enterTranslationBlock()
      } else {
        // JavaScript block should be ignored
        this.parseJavaScriptBlock()
      }
      return
    }
    if (this.match(CharCodes.SINGLE_QUOTE)) {
      this.parseSingleQuoteString()
      return
    }
    if (this.match(CharCodes.DOUBLE_QUOTE)) {
      this.parseDoubleQuoteString()
      return
    }
    if (this.match(CharCodes.BACK_QUOTE)) {
      this.parseTemplateString()
      return
    }
    if (this.match(CharCodes.RIGHT_CURLY_BRACE)) {
      this.advance()
      // end block }}
      if (this.match(CharCodes.RIGHT_CURLY_BRACE)) {
        const { start, end, block } = this.exitTranslationBlock()
        this.advance()
        console.log('block matched', block)
        if (end > start && start !== -1) this.statements.push(new TranslationStatement(start, end, block))
      }
      return
    }
    if (this.match(CharCodes.LESS_THAN)) {
      const startTagEndPos = this.getWXMLStartTag(this.pos)
      if (startTagEndPos !== -1) {
        console.log('startTag', this.source.substring(this.pos, startTagEndPos + 1))
        this.parseWXMLStartTag()
      } else this.advance()
      return
    }
    this.advance()
  }

  parseJavaScriptBlock() {
    while (!this.eof()) {
      if (this.match(CharCodes.RIGHT_CURLY_BRACE)) {
        this.advance()
        return
      }
      this._parse()
    }
  }

  parseSingleQuoteString() {
    this.advance()
    while (!this.eof()) {
      if (this.match(CharCodes.BACK_SLASH) && this.matchNextChar(CharCodes.SINGLE_QUOTE)) {
        console.log('matched escaped single quote')
        this.advance()
      } else if (this.match(CharCodes.SINGLE_QUOTE)) {
        this.advance()
        return
      } else {
        this.advance()
      }
    }
  }

  parseDoubleQuoteString() {
    while (!this.eof()) {
      if (this.match(CharCodes.BACK_SLASH) && this.matchNextChar(CharCodes.DOUBLE_QUOTE)) {
        console.log('matched escaped double quote')
        this.advance()
      } else if (this.matchNextChar(CharCodes.DOUBLE_QUOTE)) {
        this.advance()
        return
      }
    }
  }

  parseTemplateString() {
    while (!this.eof()) {
      if (this.match(CharCodes.BACK_SLASH) && this.matchNextChar(CharCodes.BACK_QUOTE)) {
        console.log('matched escaped backtick')
        this.advance()
      } else if (this.matchNextChar(CharCodes.BACK_QUOTE)) {
        this.advance()
        return
      }
    }
  }

  /**
   * Nested object declaration may also contains doubble end braces,
   * thus object declaration should also be ignored.
   */
  parseObject() {
    while (!this.eof()) {
      if (this.matchNextChar(CharCodes.RIGHT_CURLY_BRACE)) {
        this.advance()
        return
      }
    }
  }

  parseWXMLStartTag() {
    console.log('@@@ WXS start tag found')
    while (!this.eof()) {
      this.advance()
      if (this.match(CharCodes.SLASH)) {
        this.advance()
        // <string />
        if (this.match(CharCodes.GREATER_THAN)) {
          this.advance()
          return
        }
      }
      if (this.match(CharCodes.LESS_THAN)) {
        if (this.isWXMLEndTag(this.pos)) {
          console.log('@@@ WXS end tag found')
        }
      }
    }
  }

  enterTranslationBlock() {
    // Already in an translation block, this must not be
    // valid translation block
    if (this.blockStart !== -1) return
    this.blockStart = this.pos
  }

  exitTranslationBlock(): { start: number, end: number, block: string } {
    const start = this.blockStart
    const end = this.pos - 1
    const block = this.source.substring(start, end)
    this.blockStart = -1
    return { start, end, block }
  }

  getWXMLStartTag(pos: number) {
    if (!this.match(CharCodes.LESS_THAN, pos)) return -1
    pos++

    this.skipWhiteSpaces(pos)

    // <string
    while (this.isLetter(this.source.charCodeAt(pos))) pos++
    this.skipWhiteSpaces(pos)

    // TODO: how we should do to self-close tag
    // <string /
    if (this.match(CharCodes.SLASH, pos)) {
      pos++
    }
    // >
    if (this.match(CharCodes.GREATER_THAN, pos)) {
      return pos
    }
    return -1
  }

  isWXMLEndTag(pos: number) {
    pos++

    this.skipWhiteSpaces(pos)
    // not </
    if (!this.match(CharCodes.SLASH, pos)) {
      return false
    }

    pos++

    // </string
    while (this.isLetter(this.source.charCodeAt(pos))) pos++

    this.skipWhiteSpaces(pos)

    // >
    if (this.match(CharCodes.GREATER_THAN, pos)) {
      return true
    }
    return false
  }

  match(code: CharCodes, pos?: number) {
    return this.source.charCodeAt(pos && pos !== -1 ? pos : this.pos) === code
  }

  // FIXME: remove this unnecessary helper function
  matchNextChar(code: CharCodes) {
    return this.source.charCodeAt(++this.pos) === code
  }

  isLetter(code: number) {
    return (code >= 0x41 && code <= 0x5A) ||    // A-Z
      (code >= 0x61 && code <= 0x7A) ||         // a-z
      code === 0x2D ||                          // -
      code === 0x5F                             // _
  }

  skipWhiteSpaces(pos?: number) {
    while (
      this.match(CharCodes.SPACE, pos) ||
      this.match(CharCodes.TAB, pos) ||
      this.match(CharCodes.LINE_FEED, pos) ||
      this.match(CharCodes.CARRIAGE_RETURN, pos)
    ) {
      if (pos) pos++
      else this.advance()
    }
  }

  advance() {
    this.pos++
  }

  eof() {
    return this.pos === this.source.length
  }
}
