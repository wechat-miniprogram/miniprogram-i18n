import { interpret } from '../interpreter'
import { lookUpAST } from '../common'

export function getMessageInterpreter(translations: any) {

  function evaluate(key: string, params: any, locale: string) {
    // FIXME: add fallback locale
    const message = lookUpAST(key, translations, locale, 'en-US')
    return interpret(message, params)
  }

  return function _interpret(key: string, params: any, locale: string) {
    if (arguments.length === 2) {
      const key = arguments[0]
      const locale = arguments[1]
      return evaluate(key, null, locale)
    }
    if (arguments.length === 3) {
      const key = arguments[0]
      const params = arguments[1]
      const locale = arguments[2]
      return evaluate(key, params, locale)
    }
    return ''
  }
}
