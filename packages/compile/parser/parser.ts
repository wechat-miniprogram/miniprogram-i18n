import { isWhitespace } from './utils'
import { CharCodes } from './types'

type QuoteStringResultRef = { result?: string }

export default class Parser {
  protected pos: number = 0
  public line: number = 1
  public column: number = 1

  constructor(public source: string, public fileName: string) {}

  consumeChar() {
    const ch = this.source.charCodeAt(this.pos)
    this.advance()
    return ch
  }

  consumeQuoteString(resultRef: QuoteStringResultRef = {}) {
    const start = this.pos
    if (this.match(CharCodes.SINGLE_QUOTE) || this.match(CharCodes.DOUBLE_QUOTE) || this.match(CharCodes.BACK_QUOTE)) {
      const quoteType = this.consumeChar()
      while (!this.eof() && !this.match(quoteType)) {
        if (this.match(CharCodes.BACK_SLASH) && this.match(quoteType, this.pos + 1)) {
          this.advance(2)
        } else this.advance()
      }
      if (this.match(quoteType)) this.advance()
      resultRef.result = this.source.substring(start, this.pos)
      return true
    }
    return false
  }

  advance(step?: number) {
    const _advanceOnce = () => {
      if (this.source[this.pos] === '\n') {
        this.column = 1
        this.line++
      } else {
        this.column++
      }
      this.pos++
    }

    if (!step) {
      _advanceOnce()
    } else {
      while (step-- > 0) _advanceOnce()
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

  public currentContext(): string {
    const MAX_NEXT_LINE = 2
    let answer = ''

    let _pos = this.pos - 1, accumulateNextLine = 0
    while (_pos >= 0 && accumulateNextLine < MAX_NEXT_LINE + 2) {
      if (this.source[_pos] === '\n') {
        accumulateNextLine++
      }
      answer = this.source[_pos] + answer
      _pos--
    }

    if (this.pos < this.source.length) {
      answer += this.source[this.pos]
    }

    _pos = this.pos + 1, accumulateNextLine = 0
    while (_pos < this.source.length && accumulateNextLine < MAX_NEXT_LINE) {
      if (this.source[_pos] === '\n') {
        accumulateNextLine++
      }

      answer += this.source[_pos]
      _pos++
    }

    return answer
  }
}
