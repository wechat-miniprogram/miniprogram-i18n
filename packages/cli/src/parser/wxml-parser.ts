import { CharCodes } from './char-codes'

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

export default class WxmlParser {
  private pos: number = 0
  private state: WxmlState = WxmlState.NORMAL

  constructor(
    public source: string,
  ) { }

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
        if (this.match(CharCodes.SINGLE_QUOTE) || this.match(CharCodes.DOUBLE_QUOTE) || this.match(CharCodes.BACK_QUOTE)) {
          const quoteType = this.consumeChar()
          while (!this.eof() && !this.match(quoteType)) {
            if (this.match(CharCodes.BACK_SLASH) && this.match(quoteType, this.pos + 1)) {
              this.advance(2)
            }
            this.advance()
          }
        }
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
    return this.consumeWhile(c => this.isLetter(c) || this.isNumber(c))
  }

  parseAttributeName() {
    // loosy check
    // TODO: prevent number as first letter
    // Note: can have colon (:) in between
    return this.consumeWhile(c => this.isLetter(c) || this.isNumber(c) || c === CharCodes.COLON)
  }

  parseAttributes() {
    const attrs = new Map()
    while (!this.eof()) {
      this.consumeWhitespace()
      if (this.match(CharCodes.SLASH) || this.match(CharCodes.GREATER_THAN)) break
      if (!this.isLetter(this.peekCharCode()) && !this.match(CharCodes.COLON)) break
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

  isWhitespace(code: number) {
    return CharCodes.SPACE === code ||
      CharCodes.TAB === code ||
      CharCodes.LINE_FEED === code ||
      CharCodes.CARRIAGE_RETURN === code
  }

  isLetter(code: number) {
    return (code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||    // A-Z
      (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||         // a-z
      code === CharCodes.MINUS ||                                         // -
      code === CharCodes.UNDER_LINE                                       // _
  }

  isNumber(code: number) {
    return code >= CharCodes._0 && code <= CharCodes._9    // 0-9
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

  consumeChar() {
    const ch = this.source.charCodeAt(this.pos)
    this.advance()
    return ch
  }

  consumeWhitespace() {
    this.consumeWhile(this.isWhitespace)
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
}
