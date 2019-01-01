
export const enum CharCodes {
  LEFT_CURLY_BRACE = 0x7B,    // {
  RIGHT_CURLY_BRACE = 0x7D,   // }
  SINGLE_QUOTE = 0x27,        // '
  DOUBLE_QUOTE = 0x22,        // "
  BACK_QUOTE = 0x60,          // `
  BACK_SLASH= 0x5C,           // \
}

class TranslationStatement {
  constructor(
    public start: number = 0,
    public end: number = 0,
    public statement: string = '',
  ) {}
}

/**
 * TranslationBlockParser is responsible for parsing translation block in xwml file
 */
export class TranslationBlockParser  {
  public pos: number = 0
  public blockStart: number = -1
  private statements: TranslationStatement[] = []

  constructor(
    public source: string,
  ) { }

  parse() {
    while (!this.eof()) this.parseTranslationBlock()
    return this.statements
  }

  parseTranslationBlock() {
    if (this.match(CharCodes.LEFT_CURLY_BRACE) && this.matchNextChar(CharCodes.LEFT_CURLY_BRACE)) {
      console.log('\n{{')
      this.advance()
      this.enterTranslationBlock()
    } else if (this.match(CharCodes.SINGLE_QUOTE)) {
      this.parseSingleQuoteString()
    } else if (this.match(CharCodes.DOUBLE_QUOTE)) {
      this.parseDoubleQuoteString()
    } else if (this.match(CharCodes.BACK_QUOTE)) {
      this.parseTemplateString()
    } else if (
      this.match(CharCodes.RIGHT_CURLY_BRACE) && this.matchNextChar(CharCodes.RIGHT_CURLY_BRACE)
    ) {
      console.log('\n}}')
      const { start, end, block } = this.exitTranslationBlock()
      this.advance()
      console.log('block matched', block)
      if (end > start && start !== -1) this.statements.push(new TranslationStatement(start, end, block))
    } else {
      this.advance()
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

  enterTranslationBlock() {
    this.blockStart = this.pos
  }

  exitTranslationBlock(): { start: number, end: number, block: string } {
    const start = this.blockStart
    const end = this.pos - 1
    const block = this.source.substring(start, end)
    this.blockStart = -1
    return { start, end, block }
  }

  match(code: CharCodes) {
    return this.source.charCodeAt(this.pos) === code
  }

  // FIXME: remove this unnecessary helper function
  matchNextChar(code: CharCodes) {
    return this.source.charCodeAt(++this.pos) === code
  }

  advance() {
    this.pos++
  }

  eof() {
    return this.pos === this.source.length
  }
}
