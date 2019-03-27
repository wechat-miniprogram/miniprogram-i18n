import { I18nPage } from '@miniprogram-i18n/core'

I18nPage({
  onLoad() {
    this.onLocaleChange((locale) => {
      console.log('current locale:', this.getLocale(), locale)
    })

    this.setLocale('zh-CN')
  },

  toggleLocale() {
    this.setLocale(
      this.getLocale() === 'zh-CN' ? 'en-US' : 'zh-CN'
    )
  },

  nativate() {
    wx.navigateTo({
      url: '/pages/logs/logs'
    })
  }
})
