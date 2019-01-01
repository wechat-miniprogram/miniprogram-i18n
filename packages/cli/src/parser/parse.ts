enum TokenType {
  LEFT_CURLY_BRACE = '{',
  RIGHT_CURLY_BRACE = '}',
  SINGLE_QUOTE = '\'',
  DOUBLE_QUOTE = '"',
  BACK_QUOTE = '`',
  BACK_SLASH= '\\',
}

/**
 * Parser is responsible for parsing translation block in xwml file
 */
export class TranslationBlockParser  {
  public pos: number = 0
  public blockStart: number = -1
  constructor(
    public source: string,
  ) { }

  parse() {
    while (!this.eof()) this.parseTranslationBlock()
  }

  parseTranslationBlock() {
    if (this.match(TokenType.LEFT_CURLY_BRACE) && this.matchNextChar(TokenType.LEFT_CURLY_BRACE)) {
      console.log('\n{{')
      this.advance()
      this.enterTranslationBlock()
      this.parseTranslationBlock()
    } else if (this.match(TokenType.SINGLE_QUOTE)) {
      this.parseSingleQuoteString()
    } else if (this.match(TokenType.DOUBLE_QUOTE)) {
      this.parseDoubleQuoteString()
    } else if (this.match(TokenType.BACK_QUOTE)) {
      this.parseTemplateString()
    } else if (
      this.match(TokenType.RIGHT_CURLY_BRACE) && this.matchNextChar(TokenType.RIGHT_CURLY_BRACE)
    ) {
      console.log('\n}}')
      const block = this.exitTranslationBlock()
      this.advance()
      console.log('block matched', block)
      // Pass translation block to babylon parser
    } else {
      this.advance()
    }
  }

  parseSingleQuoteString() {
    this.advance()
    while (!this.eof()) {
      if (this.match(TokenType.BACK_SLASH) && this.matchNextChar(TokenType.SINGLE_QUOTE)) {
        console.log('matched escaped single quote')
        this.advance()
      } else if (this.match(TokenType.SINGLE_QUOTE)) {
        this.nextChar()
        return
      } else {
        this.nextChar()
      }
    }
  }

  parseDoubleQuoteString() {
    while (!this.eof()) {
      if (this.match(TokenType.BACK_SLASH) && this.matchNextChar(TokenType.DOUBLE_QUOTE)) {
        console.log('matched escaped double quote')
        this.advance()
      } else if (this.matchNextChar(TokenType.DOUBLE_QUOTE)) {
        this.advance()
        return
      }
    }
  }

  parseTemplateString() {
    while (!this.eof()) {
      if (this.match(TokenType.BACK_SLASH) && this.matchNextChar(TokenType.BACK_QUOTE)) {
        console.log('matched escaped backtick')
        this.advance()
      } else if (this.matchNextChar(TokenType.BACK_QUOTE)) {
        this.advance()
        return
      }
    }
  }

  /**
   * Object may also contains }} in nested object declaration
   * thus object declaration should be ignored
   */
  parseObject() {
    while (!this.eof()) {
      if (this.matchNextChar(TokenType.RIGHT_CURLY_BRACE)) {
        this.advance()
        return
      }
    }
  }

  enterTranslationBlock() {
    this.blockStart = this.pos
  }

  exitTranslationBlock(): string {
    const block = this.source.substring(this.blockStart, this.pos - 1)
    this.blockStart = -1
    return block
  }

  match(type: TokenType) {
    return this.peekChar() === type
  }

  matchNextChar(type: TokenType) {
    return this.nextChar() === type
  }

  peekChar() {
    return this.source[this.pos]
  }

  nextChar() {
    return this.source[++this.pos]
  }

  advance() {
    this.pos++
  }

  eof() {
    return this.pos === this.source.length
  }
}
