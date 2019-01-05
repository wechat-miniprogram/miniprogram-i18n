import { CharCodes } from './char-codes'

const assert = (expr: boolean) => {
  if (!expr) throw new Error()
}

export class Node {
  constructor(
    public tagName: string,
  ) {}
}

export class Element extends Node {
  constructor(
    tagName: string,
    public attributes: Map<string, string> | null = null,
    public children: Array<Node> | null,
  ) {
    super(tagName)
  }
}

export class Text extends Node {
  private static tagName: string = 'text'
  constructor(
    public content: string,
  ) {
    super(Text.tagName)
  }
}

export default class WxmlParser {
  private pos: number = 0
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
        console.log('match <!--')
        this.advance(4)
        this.parseComments()
        continue
      }
      nodes.push(this.parseNode())
    }
    return nodes
  }

  parseNode() {
    if (this.match(CharCodes.LESS_THAN)) {
      return this.parseWxmlTag()
    }
    return this.parseText()
  }

  parseWxmlTag() {
    if (this.consumeChar() !== CharCodes.LESS_THAN) {
      throw new Error('unexpected character for wxml start tag')
    }

    const tagName =  this.parseTagName()
    // TODO: ignore wxs tag
    const attributes = this.parseAttributes()

    console.log('tagName:', tagName, this.currentChar())

    // self-closing tag
    if (this.match(CharCodes.SLASH)) {
      this.advance()
      if (this.consumeChar() !== CharCodes.GREATER_THAN) {
        throw new Error('unexpected character ' + this.currentChar())
      }
      console.log('@@@ self closing tag found', this.currentChar())
      return new Element(tagName, attributes, null)
    }
    if (this.consumeChar() !== CharCodes.GREATER_THAN) {
      throw new Error('unexpected character ' + this.currentChar())
    }

    const childNodes = this.parse()
    console.log('@@@@@@ current char:', this.currentChar())

    if (this.consumeChar() !== CharCodes.LESS_THAN) {
      throw new Error('expected char ' + String.fromCharCode(CharCodes.LESS_THAN) + ' but got ' + this.currentChar())
    }

    if (this.consumeChar() !== CharCodes.SLASH) {
      throw new Error('expected char ' + String.fromCharCode(CharCodes.SLASH) + ' but got ' + this.currentChar())
    }

    const endTagName = this.parseTagName()
    if (endTagName !== tagName) {
      throw new Error(`expected tag name ${tagName} but got ${endTagName}`)
    }

    if (this.consumeChar() !== CharCodes.GREATER_THAN) {
      throw new Error('expected char ' + String.fromCharCode(CharCodes.GREATER_THAN) + ' but got ' + this.currentChar())
    }

    return new Element(tagName, attributes, childNodes)
  }

  parseText() {
    return new Text(this.consumeWhile(ch => ch !== CharCodes.LESS_THAN))
  }

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
    return this.consumeWhile(this.isLetter)
  }

  parseAttributes() {
    const attrs = new Map()
    while (!this.eof()) {
      this.consumeWhitespace()
      if (this.match(CharCodes.SLASH) || this.match(CharCodes.GREATER_THAN)) break
      const { name, value } = this.parseAttribute()
      attrs.set(name, value)
    }
    return attrs
  }

  parseAttribute() {
    const name = this.parseTagName()
    this.consumeWhitespace()
    // TODO: may not have values
    if (!this.match(CharCodes.EQUALS)) {
      return { name, value: null }
    }
    this.advance()
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
    // TODO: consider escaped quote, escaped quote should not interrupt parsing
    const value = this.consumeWhile(ch => ch !== leftQuote)
    if (this.consumeChar() !== leftQuote) {
      throw new Error('expected char ' + String.fromCharCode(leftQuote) + ' but got ' + this.currentChar())
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

  match(code: CharCodes, pos?: number) {
    return this.source.charCodeAt(pos && pos !== -1 ? pos : this.pos) === code
  }

  // for debug
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
