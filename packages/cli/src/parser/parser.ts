import { isWhitespace } from './utils'
import { CharCodes } from './types'

export default class Parser {
  protected pos: number = 0

  constructor(public source: string) {}

  consumeChar() {
    const ch = this.source.charCodeAt(this.pos)
    this.advance()
    return ch
  }

  consumeQuoteString() {
    if (this.match(CharCodes.SINGLE_QUOTE) || this.match(CharCodes.DOUBLE_QUOTE) || this.match(CharCodes.BACK_QUOTE)) {
      const quoteType = this.consumeChar()
      while (!this.eof() && !this.match(quoteType)) {
        if (this.match(CharCodes.BACK_SLASH) && this.match(quoteType, this.pos + 1)) {
          this.advance(2)
        } else this.advance()
      }
    }
  }

  advance(step?: number) {
    if (!step) {
      this.pos++
    } else {
      while (step-- > 0) this.pos++
    }
  }

  eof() {
    return this.pos >= this.source.length
  }

  match(code: CharCodes, pos?: number) {
    return this.source.charCodeAt(pos && pos !== -1 ? pos : this.pos) === code
  }

  currentChar() {
    return this.source[this.pos]
  }

  peekCharCode() {
    return this.source.charCodeAt(this.pos)
  }

  consumeWhitespace() {
    this.consumeWhile(isWhitespace)
  }

  consumeWhile(checkFunc: (a: number) => boolean) {
    const result: Array<string> = []
    while (!this.eof() && checkFunc(this.source.charCodeAt(this.pos))) {
      const ch = this.source[this.pos]
      this.advance()
      result.push(ch)
    }
    return result.join('')
  }
}
