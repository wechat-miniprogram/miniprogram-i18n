import interpret from 'format-message-interpret'

export interface MiniProgramI18nInterface {
  getString(key: string, params?: object): string
  getLocale(): string
  setLocale(locale: string): void
}

export const enum Locale {
  default = 'en-US',
}

export class I18nRuntimeBase {
  constructor(
    public translations: any = {},
    public currentLocale: string = Locale.default,
  ) {}

  findMessageAST(key: string) {
    return this.translations[this.currentLocale][key]
  }

  getString(key: string, options?: object) {
    const ast = this.findMessageAST(key)
    const formatted = interpret(ast, this.currentLocale)(options)
    return formatted
  }

  setLocale(locale: string) {
    this.currentLocale = locale
  }

  loadTranslations(locales: object) {
    if (locales && typeof locales === 'object') this.translations = locales
  }
}
