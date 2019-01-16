import WxmlParser, { Text, Element, Node, AttributeValue } from '../parser/wxml-parser'
import ExpressionParser, { CallExpression } from '../parser/expression-parser'

export const enum TranslationFunction {
  default = 't',
}

export const enum I18nModuleName {
  default = 'i18n',
}

export const enum LocaleVariable {
  default = '$_locale',
}

const BLOCK_DELIMITER_START = '{{'

/**
 * Transform miniprogram templates (WXML) to import i18n data and transform i18n invocations
 * i18n data will be imported via WXS mechanism while i18n invocations will be transformed
 * to normal WXS calls, e.g. t(key, val) will be transformed to something like $i18n.t(key, val)
 */
export class TranslationFunctionTransformer {
  private source: string = ''

  constructor(
    private translationFunctionName: string = TranslationFunction.default,
    private i18nModuleName: string = I18nModuleName.default,
    private currentLocaleVariableName: string = LocaleVariable.default,
  ) { }

  /**
   * Given a piece of wxml source code, transform its i18n function calls into normal wxs function calls
   */
  public transform(source: string): string {
    this.source = source
    const parser = new WxmlParser(source)
    const nodes = parser.parse()
    // Transform function call expressions in place
    this.transformNodes(nodes)
    return this.source
  }

  private transformNodes(nodes: Node[]) {
    // walk through wxml nodes to pick up interpolation blocks
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (node instanceof Text) {
        if (node.content.includes(BLOCK_DELIMITER_START)) {
          const { content, transformed } = this.transformFunctionCallExpr(node.content)
          if (transformed) {
            const head = this.source.substring(0, node.start)
            const rear = this.source.substring(node.end)
            this.source = head + content + rear
          }
        }
      } else if (node instanceof Element) {
        this.transformNodes(node.children)
        const attributes = this.sortAttributesByStartPos(node.attributes)
        for (const attrValue of attributes) {
          if (attrValue && attrValue.value.includes(BLOCK_DELIMITER_START)) {
            const { content, transformed } = this.transformFunctionCallExpr(attrValue.value)
            if (transformed) {
              const head = this.source.substring(0, attrValue.start)
              const rear = this.source.substring(attrValue.end)
              this.source = head + content + rear
            }
          }
        }
      }
    }
  }

  private transformFunctionCallExpr(source: string) {
    const parser = new ExpressionParser(source)
    const expr = parser.parse()
    return this.transformFunctionCallExprRecursively(source, expr.callExpressions)
  }

  private transformFunctionCallExprRecursively(source: string, callExpressions: CallExpression[]) {
    let transformed = false
    for (let i = callExpressions.length - 1; i >= 0; i--) {
      const callExpr = callExpressions[i]
      if (callExpr.expression === this.translationFunctionName) {
        // Inject currentLocale variable
        const end = callExpr.end - 1
        const localeVarDecl = callExpr.parameters.length > 0 ? `, ${this.currentLocaleVariableName}` : this.currentLocaleVariableName
        source = source.substring(0, end) + localeVarDecl + source.substring(end)

        const child = this.transformFunctionCallExprRecursively(source, callExpr.childFunctionExpressions)
        transformed = transformed || child.transformed
        source = child.content

        const head = source.substring(0, callExpr.functionNameStart)
        const rear = source.substring(callExpr.functionNameEnd)
        source = head + this.i18nModuleName + '.' + TranslationFunction.default + rear
        transformed = true
      }
    }
    return { transformed, content: source }
  }

  private sortAttributesByStartPos(attributes: Map<string, AttributeValue | null>) {
    // descendent
    return Array.from(attributes.values()).filter(a => !!a).sort((a, b) => b!.start - a!.start)
  }
}
