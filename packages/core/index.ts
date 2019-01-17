import Notification, { Handler } from './notification'
import { interpret } from './interpreter'
import { lookUpAST } from './common'

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
    public fallbackLocale: string = Locale.default,
  ) {
    if (!this.translations) {
      throw new Error('[i18n] translations should be specified before using I18n')
    }
  }

  lookUpAST(key: string) {
    return lookUpAST(key, this.translations, this.currentLocale, this.fallbackLocale)
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

  getFallbackLocale() {
    return this.fallbackLocale
  }

  /**
   * const listener = onLocaleChange(() => {})
   * listener.off()
   * @param handler
   */
  onLocaleChange(handler: Handler) {
    notification.subscribe(LOCALE_CHANGE_NOTIFICATION_NAME, handler)
    return {
      off() {
        notification.unsubscribe(LOCALE_CHANGE_NOTIFICATION_NAME, handler)
      },
    }
  }
}

interface Global {
  i18nInstance: I18nRuntimeBase | null
}

const innerGlobals: Global = {
  i18nInstance: null,
}

// Find locales by default from /i18n/locales.js
const DEFAULT_LOCALE_PATH = '/i18n/locales.js'
try {
  // tslint:disable-next-line
  const locales = require(DEFAULT_LOCALE_PATH)
  if (locales && locales.translations) {
    innerGlobals.i18nInstance = new I18nRuntimeBase(locales.translations, locales.defaultLocale, locales.fallbackLocale)
  }
} catch (_) {}

export function initI18n(translations: any, currentLocale: string) {
  if (!innerGlobals.i18nInstance) innerGlobals.i18nInstance = new I18nRuntimeBase(translations, currentLocale)
  return innerGlobals.i18nInstance
}

export function getI18nInstance() {
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
  getLocale: () => string,
  setLocale: (locale: string) => void,
  onLocaleChange: (handler: Handler) => object
}

/** Provided by miniprogram runtime globally */
declare const Page: (obj: object) => void
declare var Behavior: (obj: object) => void

/**
 * Should provide page wrapper, prefer I18n behaviors using Component ctor
 */
export function I18nPage(pageObject: PageObject) {
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
    [LOCALE_CHANGE_HANDLER_NAME](currentLocale: string) {
      (this as any).setData({
        [CURRENT_LOCALE_KEY]: currentLocale,
      })
    },

    /**
     * Setting up event listeners to trigger page rerender when locale changed
     */
    onLoad(...args) {
      (this as any).setData({
        [CURRENT_LOCALE_KEY]: innerGlobals.i18nInstance && innerGlobals.i18nInstance.currentLocale,
      })
      notification.subscribe(LOCALE_CHANGE_NOTIFICATION_NAME, this[LOCALE_CHANGE_HANDLER_NAME])
      if (typeof pageObject.onLoad === 'function') pageObject.onLoad.apply(this, args)
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
        throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.getString(key, params)
    },

    getLocale() {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.getLocale()
    },

    setLocale(locale: string) {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
      }
      innerGlobals.i18nInstance.setLocale(locale)
    },

    onLocaleChange(handler: Handler) {
      if (!innerGlobals.i18nInstance) {
        throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
      }
      return innerGlobals.i18nInstance.onLocaleChange(handler)
    },

  }

  return Page(Object.assign({}, pageObject, hooks))
}


export const I18n = Behavior((() => {
  const behaviorHooks = {
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
          throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
        }

        (this as any).setData({
          [CURRENT_LOCALE_KEY]: innerGlobals.i18nInstance.currentLocale,
        })

        notification.subscribe(LOCALE_CHANGE_NOTIFICATION_NAME, (this as any)[LOCALE_CHANGE_HANDLER_NAME])
      },

      detached() {
        notification.unsubscribe(LOCALE_CHANGE_NOTIFICATION_NAME, (this as any)[LOCALE_CHANGE_HANDLER_NAME]!)
      },
    },

    methods: {},
  };

  (behaviorHooks.methods as any).t = (key: string, params: object) => {
    if (!innerGlobals.i18nInstance) {
      throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
    }
    return innerGlobals.i18nInstance.getString(key, params)
  }

  (behaviorHooks.methods as any).setLocale = (locale: string) => {
    if (!innerGlobals.i18nInstance) {
      throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
    }
    return innerGlobals.i18nInstance.setLocale(locale)
  }

  (behaviorHooks.methods as any).getLocale = () => {
    if (!innerGlobals.i18nInstance) {
      throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
    }
    return innerGlobals.i18nInstance.getLocale()
  }

  (behaviorHooks.methods as any).onLocaleChange = (handler: Handler) => {
    if (!innerGlobals.i18nInstance) {
      throw new Error('[i18n] ensure run initI18n() in app.js before using I18n library')
    }
    return innerGlobals.i18nInstance.onLocaleChange(handler)
  }

  return behaviorHooks
})())
