import { CharCodes } from './types'
import Parser from './parser'
import { isWhitespace, isValidFunctionLiteralChar } from './utils'

export const WXS_LITERAL = 'wxs'

class Expression {
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
 * 4. should parse function calls inside block
 */

/**
 * BlockParser helps parsing expressions inside wxml interpolation block
 */
export default class ExpressionParser extends Parser {
  private blockStart: number = -1
  private expressions: Expression[] = []
  private callExpressions: Expression[] = []

  constructor(
    public source: string,
  ) {
    super(source)
  }

  parse() {
    while (!this.eof()) {
      if (this.match(CharCodes.LEFT_CURLY_BRACE) && this.match(CharCodes.LEFT_CURLY_BRACE, this.pos + 1)) {
        this.advance(2)
        this.enterInterpolationBlock()
        // TODO: parse function calls and pass it to transfomers
        this.parseInterpolationExpression()
        continue
      }
      this.advance()
    }
    return { expression: this.expressions, callExpression: this.callExpressions }
  }

  /**
   * Parse expressions in wxml, it only cares about function calls
   * and ignore other expressions since it's trivial for i18n
   */
  parseInterpolationExpression() {
    while (!this.eof()) {
      this.consumeQuoteString()

      if (this.match(CharCodes.RIGHT_CURLY_BRACE) && this.match(CharCodes.RIGHT_CURLY_BRACE, this.pos + 1)) {
        const { start, end, block } = this.exitInterpolationBlock()
        this.advance(2)
        if (end > start && start !== -1) {
          this.expressions.push(new Expression(start, end, block))
        }
        return
      }

      // maybe function call expression
      if (this.match(CharCodes.LEFT_PAREN)) {
        const start = this.isFunctionCallExpression(this.pos)
        if (start !== -1) {
          this.callExpressions.push(new Expression(start, this.pos, this.source.substring(start, this.pos)))
        }
      }

      if (this.match(CharCodes.LEFT_CURLY_BRACE)) {
        // JavaScript block should be ignored
        this.advance()
        this.parseJavaScriptBlock()
      }
      this.advance()
    }
  }

  parseJavaScriptBlock() {
    while (!this.eof()) {
      this.consumeQuoteString()

      if (this.match(CharCodes.RIGHT_CURLY_BRACE)) {
        this.advance()
        return
      }
      if (this.match(CharCodes.LEFT_PAREN)) {
        const start = this.isFunctionCallExpression(this.pos)
        if (start !== -1) {
          this.callExpressions.push(new Expression(start, this.pos, this.source.substring(start, this.pos)))
        }
      }
      if (this.match(CharCodes.LEFT_CURLY_BRACE)) {
        this.advance()
        this.parseJavaScriptBlock()
        continue
      }
      this.advance()
    }
  }

  enterInterpolationBlock() {
    // Already in an translation block, this must not be
    // valid translation block
    if (this.blockStart !== -1) return
    this.blockStart = this.pos
  }

  exitInterpolationBlock(): { start: number, end: number, block: string } {
    const start = this.blockStart
    const end = this.pos
    const block = this.source.substring(start, end)
    this.blockStart = -1
    return { start, end, block }
  }

  matchNextChar(code: CharCodes) {
    return this.source.charCodeAt(++this.pos) === code
  }

  isFunctionCallExpression(pos: number) {
    while (--pos >= 0 && !isWhitespace(this.source.charCodeAt(pos)) && !this.match(CharCodes.LEFT_CURLY_BRACE, pos)) {
      // maybe wxs call
      if (!isValidFunctionLiteralChar(this.source.charCodeAt(pos))) return -1
    }
    return pos + 1
  }
}
