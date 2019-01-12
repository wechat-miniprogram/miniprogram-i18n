const interpret = require('format-message-interpret')
import Notification from './notification'

export interface MiniProgramI18nInterface {
  getString(key: string, params?: object): string
  getLocale(): string
  setLocale(locale: string): void
}

export const enum Locale {
  default = 'en-US',
}

const LOCALE_CHANGE_NOTIFICATION_NAME = 'localeChange'

const notification = new Notification()

export class I18nRuntimeBase {
  constructor(
    public translations: any = {},
    public currentLocale: string = Locale.default,
  ) {}

  lookUpAST(key: string) {
    return this.translations[this.currentLocale][key]
  }

  getString(key: string, options?: object) {
    const ast = this.lookUpAST(key)
    const formatted = interpret(ast, this.currentLocale)(options)
    return formatted
  }

  setLocale(locale: string) {
    this.currentLocale = locale
    notification.public(LOCALE_CHANGE_NOTIFICATION_NAME, this.currentLocale)
  }

  loadTranslations(locales: object) {
    if (locales && typeof locales === 'object') this.translations = locales
  }
}

interface Global {
  i18nInstance: I18nRuntimeBase | null
}

const innerGlobals: Global = {
  i18nInstance: null,
}

export function createI18n(translations: any, currentLocale: string) {
  innerGlobals.i18nInstance = new I18nRuntimeBase(translations, currentLocale)
  return innerGlobals.i18nInstance
}

const CURRENT_LOCALE_KEY = '$_locale'
const LOCALE_CHANGE_HANDLER_NAME = '$_localeChange'

interface PageObject {
  data?: object,
  [LOCALE_CHANGE_HANDLER_NAME]: (locale: string) => void,
  onLoad: () => void,
  onUnload: () => void,
}

export default function I18n(pageObject: PageObject) {
  pageObject = pageObject || {}

  if (!innerGlobals.i18nInstance) {
    throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
  }
  if (pageObject.data && pageObject.data.hasOwnProperty(CURRENT_LOCALE_KEY)) {
    throw new Error('[i18n] conflict data field [' + CURRENT_LOCALE_KEY + '] with I18n library')
  }
  if (pageObject.hasOwnProperty(LOCALE_CHANGE_HANDLER_NAME)) {
    throw new Error('[i18n] conflict page method [' + LOCALE_CHANGE_HANDLER_NAME + '] with I18n library')
  }

  const hooks: PageObject = {
    /**
     * hooks data field to inject current locales into page
     */
    data: Object.assign({}, pageObject.data || {}, {
      [CURRENT_LOCALE_KEY]: innerGlobals.i18nInstance.currentLocale,
    }),

    [LOCALE_CHANGE_HANDLER_NAME](currentLocale: string) {
      (this as any).setData({
        [CURRENT_LOCALE_KEY]: currentLocale,
      })
    },

    /**
     * Setting up event listeners to trigger page rerender when locale changed
     */
    onLoad(...args) {
      if (typeof pageObject.onLoad === 'function') pageObject.onLoad(...args)
      notification.subscribe(LOCALE_CHANGE_NOTIFICATION_NAME, this[LOCALE_CHANGE_HANDLER_NAME])
    },

    /**
     * Tear down event listeners
     */
    onUnload(...args) {
      if (typeof pageObject.onUnload === 'function') pageObject.onUnload(...args)
      notification.unsubscribe(LOCALE_CHANGE_NOTIFICATION_NAME, this[LOCALE_CHANGE_HANDLER_NAME]!)
    },
  }

  return Object.assign({}, pageObject, hooks)
}
