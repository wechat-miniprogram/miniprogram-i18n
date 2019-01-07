import MessageFormat from 'message-format'

export interface MiniProgramI18nInterface {
  getString(key: string, params?: object): string
  getLocale(): string
  setLocale(locale: string): void
}

export const enum Locale {
  default = 'en-US',
}

export class I18nRuntime {

  constructor(
    public translations: any = {},
    public currentLocale: string = Locale.default,
  ) {}

  findTranslationMessage(key: string) {
    return this.translations[this.currentLocale][key]
  }

  getString(key: string, options?: object) {
    const message = this.findTranslationMessage(key)
    if (options && typeof options === 'object') {
      // TODO: add cache?
      const messageInst = new MessageFormat(message, this.currentLocale)
      const formatted = messageInst.format(options)
      return formatted
    }
    return message
  }

  setLocale(locale: string) {
    this.currentLocale = locale
  }

  loadTranslations(locales: object) {
    if (locales && typeof locales === 'object') this.translations = locales
  }

}
