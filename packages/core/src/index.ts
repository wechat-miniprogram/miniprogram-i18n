export interface MiniProgramI18nInterface {
  t(key: string, params: object): string
  getLocale(): string
  setLocale(locale: string): void
}

export class I18nRuntime {
  public currentLocale: string = ''

  constructor(
    public locales: object = {},
  ) {}

  loadLocales(locales: object) {
    if (locales && typeof locales === 'object') this.locales = locales
  }

  get(key: string) {

  }

  setLocale(locale: string) {
    this.currentLocale = locale
  }

}
