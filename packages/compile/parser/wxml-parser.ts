import { CharCodes, WXS_LITERAL } from './types'
import Parser from './parser'
import { isLetter, isNumber } from './utils'

interface Dumpable {
  dump(): object
}

export class Node implements Dumpable {
  constructor(
    public tagName: string,
  ) {}

  dump() {
    return { type: this.tagName }
  }
}

export class AttributeValue {
  constructor(
    public value: string,
    public start: number,
    public end: number,
  ) {}
}

export class Element extends Node implements Dumpable {
  constructor(
    tagName: string,
    public attributes: Map<string, AttributeValue | null>,
    public children: Array<Node>,
  ) {
    super(tagName)
  }

  dump() {
    const attributes: any = {}
    if (this.attributes) {
      for (const [key, value] of this.attributes) {
        if (value && value.value) {
          attributes[key] = value.value
        } else {
          attributes[key] = null
        }
      }
    }
    const children = this.children.map(child => child.dump())
    return { type: this.tagName, attributes, children }
  }
}

export class Text extends Node implements Dumpable {
  private static tagName: string = 'text'
  constructor(
    public content: string,
    public start: number,
    public end: number,
  ) {
    super(Text.tagName)
  }

  dump() {
    return { type: this.tagName, content: this.content }
  }
}

export const enum WxmlState {
  NORMAL = 0x01 << 0,
  WXS = 0x01 << 1,
  INT = 0x01 << 2,
}

/**
 * Simple wxml parser
 */
export default class WxmlParser extends Parser {
  private state: WxmlState = WxmlState.NORMAL

  constructor(
    public source: string,
  ) {
    super(source)
  }

  parse() {
    const nodes: Array<Node> = []
    while (!this.eof()) {
      this.consumeWhitespace()
      if (this.match(CharCodes.LESS_THAN) && this.match(CharCodes.SLASH, this.pos + 1)) {
        break
      }

      // Ignore comments
      if (
        this.match(CharCodes.LESS_THAN, this.pos) &&
        this.match(CharCodes.EXCLAMATION, this.pos + 1) &&
        this.match(CharCodes.MINUS, this.pos + 2) &&
        this.match(CharCodes.MINUS, this.pos + 3)
      ) {
        this.advance(4)
        this.parseComments()
        continue
      }
      if (this.match(CharCodes.LESS_THAN)) {
        const node = this.parseWxmlTag()
        nodes.push(node)
        continue
      }
      const textNode = this.parseText()
      if (textNode.content.length > 0) nodes.push(textNode)
    }
    return nodes
  }

  parseWxmlTag() {
    if (this.consumeChar() !== CharCodes.LESS_THAN) {
      throw new Error('unexpected character for wxml start tag')
    }

    this.consumeWhitespace()

    const tagName =  this.parseTagName()
    if (!tagName || tagName.length === 0)  {
      throw new Error(`unexpected tag name ${this.currentChar()}`)
    }

    const attributes = this.parseAttributes()

    // self-closing tag
    if (this.match(CharCodes.SLASH)) {
      this.advance()
      if (this.consumeChar() !== CharCodes.GREATER_THAN) {
        throw new Error('unexpected character ' + this.currentChar())
      }
      return new Element(tagName, attributes, [])
    }
    if (this.consumeChar() !== CharCodes.GREATER_THAN) {
      throw new Error('expected character > to close a tag')
    }

    if (tagName.toLowerCase() === WXS_LITERAL) {
      this.state = WxmlState.WXS
    }

    const childNodes = this.parse()

    if (this.consumeChar() !== CharCodes.LESS_THAN) {
      throw new Error('expected char ' + String.fromCharCode(CharCodes.LESS_THAN) + ' but got ' + this.currentChar())
    }

    if (this.consumeChar() !== CharCodes.SLASH) {
      throw new Error('expected char ' + String.fromCharCode(CharCodes.SLASH) + ' but got ' + this.currentChar())
    }

    this.consumeWhitespace()
    const endTagName = this.parseTagName()
    if (endTagName !== tagName) {
      throw new Error(`expected tag name ${tagName} but got ${endTagName}`)
    }

    this.consumeWhitespace()

    if (!this.match(CharCodes.GREATER_THAN)) {
      throw new Error('expected char ' + String.fromCharCode(CharCodes.GREATER_THAN) + ' but got ' + this.currentChar())
    }

    this.advance()

    if (tagName.toLowerCase() === WXS_LITERAL) {
      this.state = WxmlState.NORMAL
    }

    return new Element(tagName, attributes, childNodes)
  }

  parseText() {
    const start = this.pos
    if (this.state === WxmlState.WXS) {
      while (!this.eof() && !(this.match(CharCodes.LESS_THAN) && this.match(CharCodes.SLASH, this.pos + 1))) {
        if (!this.consumeQuoteString() && !this.consumeWXSComments()) {
          this.advance()
        }
      }
      return new Text(this.source.substring(start, this.pos), start, this.pos)
    }
    return new Text(this.parseTextContents(), start, this.pos)
  }

  parseTextContents() {
    const result: Array<string> = []
    while (!this.eof() && (!this.match(CharCodes.LESS_THAN) || this.state === WxmlState.INT)) {
      const ch = this.source[this.pos]
      if (this.match(CharCodes.LEFT_CURLY_BRACE) && this.match(CharCodes.LEFT_CURLY_BRACE, this.pos + 1)) {
        this.state = WxmlState.INT
      }
      if (this.match(CharCodes.RIGHT_CURLY_BRACE) && this.match(CharCodes.RIGHT_CURLY_BRACE, this.pos + 1)) {
        this.state = WxmlState.NORMAL
      }
      this.advance()
      result.push(ch)
    }
    return result.join('')
  }

  /**
   * Ignore comments
   */
  parseComments() {
    while (!this.eof()) {
      if (
        this.match(CharCodes.MINUS, this.pos) &&
        this.match(CharCodes.MINUS, this.pos + 1) &&
        this.match(CharCodes.GREATER_THAN, this.pos + 2)
      ) {
        this.advance(3)
        return
      }
      this.advance()
    }
  }

  parseTagName() {
    // loosy check
    // TODO: prevent number as first letter
    return this.consumeWhile(c => isLetter(c) || isNumber(c))
  }

  parseAttributeName() {
    // loosy check
    // TODO: prevent number as first letter
    // Note: can have colon (:) in between
    return this.consumeWhile(c => isLetter(c) || isNumber(c) || c === CharCodes.COLON)
  }

  parseAttributes(): Map<string, AttributeValue> {
    const attrs = new Map()
    while (!this.eof()) {
      this.consumeWhitespace()
      if (this.match(CharCodes.SLASH) || this.match(CharCodes.GREATER_THAN)) break
      if (!isLetter(this.peekCharCode()) && !this.match(CharCodes.COLON)) break
      const { name, value } = this.parseAttribute()
      attrs.set(name, value)
    }
    return attrs
  }

  parseAttribute() {
    const name = this.parseAttributeName()
    this.consumeWhitespace()
    if (!this.match(CharCodes.EQUALS)) {
      return { name, value: null }
    }
    this.advance()
    this.consumeWhitespace()
    const value = this.parseAttrValue()
    return { name, value }
  }

  parseAttrValue() {
    const leftQuote = this.consumeChar()
    const start = this.pos
    if (leftQuote !== CharCodes.SINGLE_QUOTE && leftQuote !== CharCodes.DOUBLE_QUOTE) {
      throw new Error(
        `expected char ${String.fromCharCode(CharCodes.SINGLE_QUOTE)} or ${String.fromCharCode(CharCodes.DOUBLE_QUOTE)} ` +
        `but got ${String.fromCharCode(leftQuote)}`,
      )
    }
    const value = this.consumeWhile(ch => ch !== leftQuote)
    const end = this.pos
    if (this.consumeChar() !== leftQuote) {
      throw new Error('expected char ' + String.fromCharCode(leftQuote) + ' to close an attribute')
    }
    const attribute = new AttributeValue(value, start, end)
    return attribute
  }

  consumeWXSComments(): boolean {
    if (this.match(CharCodes.SLASH) && this.match(CharCodes.SLASH, this.pos + 1)) {
      while (!this.eof()) {
        if (this.match(CharCodes.LINE_FEED)) {
          this.advance()
          break
        }
        if (this.match(CharCodes.CARRIAGE_RETURN) && this.match(CharCodes.LINE_FEED)) {
          this.advance(2)
          break
        }
        // If no line end is met we should end at this point
        if (this.match(CharCodes.LESS_THAN) && this.match(CharCodes.SLASH, this.pos + 1)) {
          return false
        }
        this.advance()
      }
      return true
    } else if (this.match(CharCodes.SLASH) && this.match(CharCodes.ASTERISK, this.pos + 1)) {
      while (!this.eof()) {
        if (this.match(CharCodes.ASTERISK) && this.match(CharCodes.SLASH, this.pos + 1)) {
          this.advance(2)
          break
        }
        this.advance()
      }
      return true
    }
    return false
  }
}
