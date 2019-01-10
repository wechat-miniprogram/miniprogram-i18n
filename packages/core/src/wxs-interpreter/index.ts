/**
 * I18n message interpreter, modified from https://github.com/format-message/format-message/
 * to make it work in miniprogram js as well as wxs
 */
import formats from './formats'
// const lookupClosestLocale = require('lookup-closest-locale')
// const plurals = require('./plurals')

export function interpret(
  ast: any,
  locale: any,
  types: any,
) {
  return interpretAST(ast, null, locale || 'en', types || {}, true)
}

exports.toParts = function toParts(
  ast/*: AST */,
  locale/*:: ?: Locales */,
  types, /*:: ?: Types */
)/*: (args?: Object) => any[] */ {
  return interpretAST(ast, null, locale || 'en', types || {}, false)
}

function interpretAST(
  elements: any,
  parent: any,
  locale: any,
  types: any,
  join: any,
) {
  const parts = elements.map((element: any) => {
    return interpretElement(element, parent, locale, types, join)
  })

  if (!join) {
    return (args: any) => {
      return parts.reduce((parts: any, part: any) => {
        return parts.concat(part(args))
      }, [])
    }
  }

  if (parts.length === 1) return parts[0]
  return (args: any) => {
    let message = ''
    // tslint:disable-next-line
    for (let e = 0; e < parts.length; ++e) {
      message += parts[e](args)
    }
    return message
  }
}

function interpretElement(
  element: any,
  parent: any,
  locale: any,
  types: any,
  join: any,
) {
  if (typeof element === 'string') {
    const value /*: string */ = element
    return function format() { return value }
  }

  let id = element[0]
  const type = element[1]

  if (parent && element[0] === '#') {
    id = parent[0]
    const offset = parent[2]
    const formatter = (types.number || defaults.number)([ id, 'number' ], locale)
    return (args: any) => {
      return formatter(getArg(id, args) - offset, args)
    }
  }

  // pre-process children
  let children: any
  if (type === 'plural' || type === 'selectordinal') {
    children = {}
    Object.keys(element[3]).forEach(function(key) {
      children[key] = interpretAST(element[3][key], element, locale, types, join)
    })
    element = [ element[0], element[1], element[2], children ]
  } else if (element[2] && typeof element[2] === 'object') {
    children = {}
    Object.keys(element[2]).forEach(function(key) {
      children[key] = interpretAST(element[2][key], element, locale, types, join)
    })
    element = [ element[0], element[1], children ]
  }

  const defaultType = (defaults as any)[type]
  const getFrmt = type && (types[type] || defaultType)
  if (getFrmt) {
    const frmt = getFrmt(element, locale)
    return (args: any) => {
      return frmt(getArg(id, args), args)
    }
  }

  return join
    ? (args: any) => String(getArg(id, args))
    : (args: any) => getArg(id, args)
}

function getArg(id: any, args: any) {
  if (args && (id in args)) return args[id]
  const parts = id.split('.')
  let a = args
  for (let i = 0, ii = parts.length; a && i < ii; ++i) {
    a = a[parts[i]]
  }
  return a
}

function interpretNumber(element/*: Placeholder */, locales/*: Locales */) {
  const style = element[2]
  const options = formats.number[style] || formats.parseNumberPattern(style) || formats.number.default
  return new Intl.NumberFormat(locales, options).format
}

function interpretDuration(element/*: Placeholder */, locales/*: Locales */) {
  const style = element[2]
  const options = formats.duration[style] || formats.duration.default
  const fs = new Intl.NumberFormat(locales, options.seconds).format
  const fm = new Intl.NumberFormat(locales, options.minutes).format
  const fh = new Intl.NumberFormat(locales, options.hours).format
  const sep = /^fi$|^fi-|^da/.test(String(locales)) ? '.' : ':'

  return function(s, args) {
    s = +s
    if (!isFinite(s)) return fs(s)
    const h = ~~(s / 60 / 60) // ~~ acts much like Math.trunc
    const m = ~~(s / 60 % 60)
    const dur = (h ? (fh(Math.abs(h)) + sep) : '') +
      fm(Math.abs(m)) + sep + fs(Math.abs(s % 60))
    return s < 0 ? fh(-1).replace(fh(1), dur) : dur
  }
}

function interpretDateTime(element/*: Placeholder */, locales/*: Locales */) {
  const type = element[1]
  const style = element[2]
  const options = formats[type][style] || formats.parseDatePattern(style) || formats[type].default
  return new Intl.DateTimeFormat(locales, options).format
}

function interpretPlural(element/*: Placeholder */, locales/*: Locales */) {
  const type = element[1]
  const pluralType = type === 'selectordinal' ? 'ordinal' : 'cardinal'
  const offset = element[2]
  const children = element[3]
  let pluralRules
  if (Intl.PluralRules && Intl.PluralRules.supportedLocalesOf(locales).length > 0) {
    pluralRules = new Intl.PluralRules(locales, { type: pluralType })
  } else {
    const locale = lookupClosestLocale(locales, plurals)
    const select = (locale && plurals[locale][pluralType]) || returnOther
    pluralRules = { select: select }
  }

  return function(value, args) {
    const clause =
      children['=' + +value] ||
      children[pluralRules.select(value - offset)] ||
      children.other
    return clause(args)
  }
}

function returnOther(/*:: n:number */) { return 'other' }

function interpretSelect(element/*: Placeholder */, locales/*: Locales */) {
  const children = element[2]
  return function(value, args) {
    const clause = children[value] || children.other
    return clause(args)
  }
}

const defaults /*: Types */ = {
  number: interpretNumber,
  ordinal: interpretNumber, // TODO: support rbnf
  spellout: interpretNumber, // TODO: support rbnf
  duration: interpretDuration,
  date: interpretDateTime,
  time: interpretDateTime,
  plural: interpretPlural,
  selectordinal: interpretPlural,
  select: interpretSelect,
}
exports.types = defaults
