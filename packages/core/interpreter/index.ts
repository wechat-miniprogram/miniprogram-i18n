type AST = Array<any>

const EMPTY = ''

export function interpret(message: AST, params?: any): string {
  if (!message) return EMPTY
  if (typeof message === 'string') return message
  return message.reduce((acc, cur) => {
    return acc.concat([_eval(cur, params)])
  }, []).join('')
}

function _eval(element: any, params: any): string {
  params = params || {}
  if (typeof element === 'string') {
    return element
  }
  if (element[2] && typeof element[2] === 'object') {
    const childExprs = Object.keys(element[2]).reduce((acc: Record<string, string>, key: string) => {
      acc[key] = interpret(element[2][key], params)
      return acc
    }, {}) as Record<string, string>
    const target = childExprs[params[0]]
    const value = params[element[0]]
    if (typeof value !== 'undefined') {
      return childExprs[value.toString()] || childExprs.other || EMPTY
    }
    if (target) {
      return target
    } else {
      return childExprs.other || EMPTY
    }
  }
  // Value interpolation, element should be an array
  if (typeof element === 'object' && element.length > 0) {
    const paramName = element[0]
    const tokens = paramName.split('.')
    return getParams(tokens, params)
  }
  return ''
}

function getParams(tokens: Array<any>, params: any, i: number = 0): string {
  if (!params || !tokens || tokens.length <= 0) return ''
  const current = params[tokens[i]]
  if (!current) {
    return `{${tokens.join('.')}}`
  }
  if (typeof current === 'string') {
    return current
  }
  if (typeof current === 'number') {
    return current.toString()
  }
  return getParams(tokens, current, ++i)
}
