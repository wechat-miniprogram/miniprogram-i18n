import { CharCodes } from './types'

export function isWhitespace(code: number) {
  // TODO: other whitespaces
  return CharCodes.SPACE === code ||
    CharCodes.TAB === code ||
    CharCodes.LINE_FEED === code ||
    CharCodes.CARRIAGE_RETURN === code
}

export function isLetter(code: number) {
  return (code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||    // A-Z
    (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||         // a-z
    code === CharCodes.MINUS ||                                         // -
    code === CharCodes.UNDER_LINE                                       // _
}

export function isNumber(code: number) {
  return code >= CharCodes._0 && code <= CharCodes._9    // 0-9
}

export function isValidFunctionLiteralChar(code: number) {
  return isNumber(code) ||
    (code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||
    (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||
    code === CharCodes.UNDER_LINE ||
    code === CharCodes.$
}
