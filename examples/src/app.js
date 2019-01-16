import { getI18nInstance } from './bundle'

const i18n = getI18nInstance()

App({
  onLaunch: function () {
    console.log('onLaunch current locale:', i18n.getLocale(), i18n.t('window.title'))
    wx.setNavigationBarTitle({
      title: i18n.t('window.title')
    })
    i18n.onLocaleChange(() => {
      wx.setNavigationBarTitle({
        title: i18n.t('window.title')
      })
    })
  },
})
