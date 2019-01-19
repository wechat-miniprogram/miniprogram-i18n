# 接口文档
miniprogram-i18n API 是运行时在 JavaScript 侧操作 i18n 的接口。

## 接口列表
- [initI18n(localesConfig: object): I18n](./api.md#初始化-i18n-运行时)
- [getI18nInstance(): I18n](./api.md#i18n-接口)
- [t(key: string, params: object): string](./api.md#tkey-string-params-object-string)
- [getLocale(): string](./api.md#getlocale-string)
- [setLocale(currentLocale: string): void](./api.md#setlocalecurrentlocale-string-void)
- [getFallbackLocale(): string](./api.md#getfallbacklocale-string)
- [onLocaleChange(handler: (currentLocale: string) => void): void](./api.md#onlocalechangehandler-currentlocale-string--void-void) 

### 初始化 I18n 运行时
- initI18n(localesConfig: object): I18n
在 `app.js` 调用 initI18n 来加载 i18n 文本并指定默认语言。若未进行指定，i18n运行时将默认从 `/i18n/locales.js` 中读取文本及配置。
```js
// src/app.js
import { initI18n } from '@miniprogram-i18n/core'
import locales from '/i18n/locales.js'

initI18n(locales)

App({})

```

### 获取 I18n 运行时
- getI18nInstance(): I18n
该接口会返回 I18n 运行时实例。
```js
import { getI18nInstance } from '@miniprogram-i18n/core'

const i18n = getI18nInstance()
i18n.t('key')
```

### I18n 接口
以下五个接口用来获取或操作 I18n，均可在 I18n 实例或 拥有 I18n Behavior 的组件或 I18nPage 上进行调用。
通过组件直接访问成员函数：
```js
import { I18n } from '@miniprogram-i18n/core'
Component({
  behaviors: [I18n],

  attached() {
    this.t('key')
    this.getLocale()  // en-US
    this.setLocale('zh-CN')
    this.getFallbackLocale()  // zh-CN
    this.onLocaleChange((currentLocale) => {
      console.log('Locale changed to', currentLocale)
    })
  }
})
```
或从 I18n 实例调用:
```js
import { I18n } from '@miniprogram-i18n/core'

const i18n = getI18nInstance()

i18n.t('key')
i18n.getLocale()  // en-US
i18n.setLocale('zh-CN')
i18n.getFallbackLocale()  // zh-CN
i18n.onLocaleChange((currentLocale) => {
  console.log('Locale changed to', currentLocale)
})
```

#### t(key: string, params: object): string
最主要的翻译函数，通过该函数可以获得预先定义的 i18n 文本。



#### getLocale(): string
获取当前设置的语言。



#### setLocale(currentLocale: string): void
设置当前语言。该值应与 i18n 定义文件名相对应。



#### getFallbackLocale(): string
获取备选语言。该值在构建脚本中进行配置，一旦设置之后无法在运行时通过接口进行修改。



#### onLocaleChange(handler: (currentLocale: string) => void): void 
当前语言被修改时触发的事件回调。