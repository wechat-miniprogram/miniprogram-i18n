/**
 * Common runtime logic between js and wxs
 */

function lookUpASTFallback(translations: any, fallbackLocale: string, key: string) {
  const fallbackTranslation = translations[fallbackLocale]
  if (!fallbackTranslation) {
    return key
  }
  const translation = fallbackTranslation[key]
  if (!translation) return key
  return translation
}

export function lookUpAST(key: string, translations: any, locale: string, fallbackLocale: string) {
  const translationsForLocale = translations[locale]
  if (!translationsForLocale) {
    return lookUpASTFallback(translations, fallbackLocale, key)
  }
  const translation = translationsForLocale[key]
  if (!translation) {
    return lookUpASTFallback(translations, fallbackLocale, key)
  }
  return translation
}
