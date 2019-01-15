import Notification from './notification'
import { interpret } from './interpreter'

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
    // add fallback lang
    return this.translations[this.currentLocale][key]
  }

  getString(key: string, options?: object) {
    const ast = this.lookUpAST(key)
    const formatted = interpret(ast, options)
    return formatted
  }

  setLocale(locale: string) {
    this.currentLocale = locale
    notification.publish(LOCALE_CHANGE_NOTIFICATION_NAME, this.currentLocale)
  }

  getLocale() {
    return this.currentLocale
  }

  loadTranslations(locales: object) {
    if (locales && typeof locales === 'object') this.translations = locales
  }

  // method shortcut
  t(key: string, options?: object) {
    return this.getString(key, options)
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
  t: (key: string, params: object) => string,
}

/**
 * Should provide page wrapper, prefer I18n behaviors using Component ctor
 */
export function I18n(pageObject: PageObject) {
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
      if (typeof pageObject.onLoad === 'function') pageObject.onLoad.apply(this, args)
      notification.subscribe(LOCALE_CHANGE_NOTIFICATION_NAME, this[LOCALE_CHANGE_HANDLER_NAME])
    },

    /**
     * Tear down event listeners
     */
    onUnload(...args) {
      if (typeof pageObject.onUnload === 'function') pageObject.onUnload.apply(this, args)
      notification.unsubscribe(LOCALE_CHANGE_NOTIFICATION_NAME, this[LOCALE_CHANGE_HANDLER_NAME]!)
    },

    t(key: string, params: object) {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run createI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.getString(key, params)
    },
  }

  return Object.assign({}, pageObject, hooks)
}

/** Behavior ctor provided by miniprogram runtime globally */
declare var Behavior: (obj: object) => void

interface I18nBehaviorOptions {
  injectTranslationMethod?: boolean
  injectLocaleMethod?: boolean
}

export default (options: I18nBehaviorOptions = {}) => {
  options.injectTranslationMethod = typeof options.injectTranslationMethod !== 'undefined' ? options.injectTranslationMethod : true
  options.injectLocaleMethod = typeof options.injectLocaleMethod !== 'undefined' ? options.injectLocaleMethod : true

  const behaviorHooks = {
    data: {
      [CURRENT_LOCALE_KEY]: innerGlobals.i18nInstance && innerGlobals.i18nInstance.currentLocale,
    },

    lifetimes: {
      created() {
        (this as any)[LOCALE_CHANGE_HANDLER_NAME] = (currentLocale: string) => {
          (this as any).setData({
            [CURRENT_LOCALE_KEY]: currentLocale,
          })
        }
      },

      attached() {
        if (!innerGlobals.i18nInstance) {
          throw new Error('[i18n] ensure run createI18n() in app.js before using I18n library')
        }

        notification.subscribe(LOCALE_CHANGE_NOTIFICATION_NAME, (this as any)[LOCALE_CHANGE_HANDLER_NAME])
      },

      detached() {
        notification.unsubscribe(LOCALE_CHANGE_NOTIFICATION_NAME, (this as any)[LOCALE_CHANGE_HANDLER_NAME]!)
      },
    },

    methods: {},
  }

  if (options.injectTranslationMethod) {
    (behaviorHooks.methods as any).t = (key: string, params: object) => {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run createI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.getString(key, params)
    }
  }

  if (options.injectLocaleMethod) {
    (behaviorHooks.methods as any).setLocale = (locale: string) => {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run createI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.setLocale(locale)
    }

    (behaviorHooks.methods as any).getLocale = () => {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run createI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.getLocale()
    }
  }

  return Behavior(behaviorHooks)
}
