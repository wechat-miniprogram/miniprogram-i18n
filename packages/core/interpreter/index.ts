type AST = Array<any>

const EMPTY = ''

export function interpret(message: AST, params?: any) {
  if (!message) return EMPTY
  if (typeof message === 'string') return message
  return message.reduce((acc, cur) => {
    return acc.concat([_eval(cur, params)])
  }, []).join('')
}

function _eval(element: any, params: any) {
  params = params || {}
  if (typeof element === 'string') {
    return element
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
    return `{ ${tokens.join('.')} }`
  }
  if (typeof current === 'string') {
    return current
  }
  if (typeof current === 'number') {
    return current.toString()
  }
  return getParams(tokens, current, ++i)
}
