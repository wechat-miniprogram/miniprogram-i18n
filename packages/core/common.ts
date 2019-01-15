/**
 * Common runtime logic between js and wxs
 */

export function lookUpAST(key: string, translations: any, locale: string, fallbackLocale: string) {
  const translationsForLocale = translations[locale]
  if (!translationsForLocale) {
    const fallbackTranslation = translations[fallbackLocale]
    if (!fallbackTranslation) {
      return key
    }
    const translation = fallbackTranslation[key]
    if (!translation) return key
    return translation
  }
  const translation = translationsForLocale[key]
  if (!translation) return key
  return translation
}
