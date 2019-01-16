const parse = require('format-message-parse')

/**
 * Use parser from format-message-parse
 */
export function parseTranslation(pattern: string) {
  return parse(pattern)
}
