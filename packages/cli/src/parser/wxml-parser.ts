import { CharCodes } from './types'
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

export class Element extends Node implements Dumpable {
  constructor(
    tagName: string,
    public attributes: Map<string, string>,
    public children: Array<Node>,
  ) {
    super(tagName)
  }

  dump() {
    const attributes: any = {}
    if (this.attributes) {
      for (const [key, value] of this.attributes) {
        attributes[key] = value
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
  ) {
    super(Text.tagName)
  }

  dump() {
    return { type: this.tagName, content: this.content }
  }
}

export const WXS_LITERAL = 'wxs'

export const enum WxmlState {
  NORMAL = 0x01,
  WXS = 0x02,
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

      // <!--
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
    if (this.state === WxmlState.WXS) {
      const start = this.pos
      while (!this.eof() && !this.match(CharCodes.LESS_THAN)) {
        this.consumeQuoteString()
        this.advance()
      }
      return new Text(this.source.substring(start, this.pos))
    }
    return new Text(this.consumeWhile(ch => ch !== CharCodes.LESS_THAN))
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

  parseAttributes() {
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
    if (leftQuote !== CharCodes.SINGLE_QUOTE && leftQuote !== CharCodes.DOUBLE_QUOTE) {
      throw new Error(
        `expected char ${String.fromCharCode(CharCodes.SINGLE_QUOTE)} or ${String.fromCharCode(CharCodes.DOUBLE_QUOTE)} ` +
        `but got ${String.fromCharCode(leftQuote)}`,
      )
    }
    const value = this.consumeWhile(ch => ch !== leftQuote)
    if (this.consumeChar() !== leftQuote) {
      throw new Error('expected char ' + String.fromCharCode(leftQuote) + ' to close an attribute')
    }
    return value
  }
}
