import { CharCodes } from './char-codes'

export const WXS_LITERAL = 'wxs'

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
export class TranslationBlockParser {
  private pos: number = 0
  private blockStart: number = -1
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
        // TODO: parse function calls and pass it to transfomers
      } else {
        // JavaScript block should be ignored
        this.parseJavaScriptBlock()
      }
      return
    }
    if (this.match(CharCodes.RIGHT_CURLY_BRACE)) {
      this.advance()
      // end block }}
      if (this.match(CharCodes.RIGHT_CURLY_BRACE)) {
        const { start, end, block } = this.exitTranslationBlock()
        this.advance()
        console.log('block matched', block)
        if (end > start && start !== -1) {
          this.statements.push(new TranslationStatement(start, end, block))
        }
      }
      return
    }
    if (this.match(CharCodes.LESS_THAN)) {
      if (this.isWXSStartTag(this.pos)) {
        const ret = this.parseWXSStartTag()
        console.log('@@@@ ret:', ret)
        if (!ret) {
          throw new Error('closing tag of <wxs> is not found')
        }
      } else this.advance()
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
   * Nested object declaration may also contain double end braces,
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

  parseWXSStartTag() {
    // Assume wxs tag will not be nested
    console.log('@@@ WXS start tag found')
    while (!this.eof()) {
      if (this.match(CharCodes.SINGLE_QUOTE)) {
        this.parseSingleQuoteString()
      } else if (this.match(CharCodes.DOUBLE_QUOTE)) {
        this.parseDoubleQuoteString()
      } else if (this.match(CharCodes.BACK_QUOTE)) {
        this.parseTemplateString()
      } else this.advance()
      if (this.match(CharCodes.SLASH)) {
        this.advance()
        // <wxs />
        if (this.match(CharCodes.GREATER_THAN)) {
          this.advance()
          return true
        }
      }
      if (this.match(CharCodes.LESS_THAN)) {
        this.advance()
        // </
        if (this.match(CharCodes.SLASH)) {
          return this.parseWXSEndTag()
        }
      }
    }
    return false
  }

  parseWXSEndTag() {
    // </   wxs   >
    this.advance()
    const start = this.pos
    while (this.isLetter(this.getCurrentCharCode()) || this.isWhiteSpace(this.getCurrentCharCode())) this.advance()
    const token = this.source.substring(start, this.pos).trim().toLowerCase()
    if (token !== WXS_LITERAL) return false
    if (this.match(CharCodes.GREATER_THAN)) {
      this.advance()
      return true
    }
    this.advance()
    return false
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

  isWXSStartTag(pos: number) {
    if (!this.match(CharCodes.LESS_THAN, pos)) return false

    pos++
    pos = this.skipWhiteSpaces(pos)

    // <wxs
    const start = pos
    while (this.isLetter(this.source.charCodeAt(pos))) pos++
    const token = this.source.substring(start, pos).toLowerCase()
    if (token !== WXS_LITERAL) {
      return false
    }

    // proceed to find /> or >
    while (pos <= this.source.length) {
      pos++
      // />
      if (this.match(CharCodes.SLASH, pos) && this.match(CharCodes.GREATER_THAN, pos)) {
        return true
      }
      if (this.match(CharCodes.GREATER_THAN, pos)) {
        return true
      }
    }
    return false
  }

  match(code: CharCodes, pos?: number) {
    return this.source.charCodeAt(pos && pos !== -1 ? pos : this.pos) === code
  }

  matchNextChar(code: CharCodes) {
    return this.source.charCodeAt(++this.pos) === code
  }

  isLetter(code: number) {
    return (code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||    // A-Z
      (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||         // a-z
      code === CharCodes.MINUS ||                                         // -
      code === CharCodes.UNDER_LINE                                       // _
  }

  isWhiteSpace(pos: number) {
   return this.match(CharCodes.SPACE, pos) ||
      this.match(CharCodes.TAB, pos) ||
      this.match(CharCodes.LINE_FEED, pos) ||
      this.match(CharCodes.CARRIAGE_RETURN, pos)
  }

  skipWhiteSpaces(pos: number) {
    while (
      this.match(CharCodes.SPACE, pos) ||
      this.match(CharCodes.TAB, pos) ||
      this.match(CharCodes.LINE_FEED, pos) ||
      this.match(CharCodes.CARRIAGE_RETURN, pos)
    ) {
      pos++
    }
    return pos
  }

  getCurrentCharCode() {
    return this.source.charCodeAt(this.pos)
  }

  advance() {
    this.pos++
  }

  eof() {
    return this.pos === this.source.length
  }
}
