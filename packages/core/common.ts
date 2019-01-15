/**
 * Common logic between js and wxs
 */

export function lookUpAST(key: string, translations: any, locale: string, fallbackLocale: string) {
  const translationsForLocale = translations[locale]
  if (!translationsForLocale) {
    const fallbackTranslation = translations[fallbackLocale]
    if (!fallbackTranslation) {
      return key
    }
    return fallbackTranslation[key]
  }
}
