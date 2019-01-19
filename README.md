# miniprogram-i18n

微信小程序的国际化 (i18n) 方案。为小程序的双线程模型定制，使用 WXS 环境作为 WXML 国际化的运行时，很大程度上减少了国际化在小程序中运行所需的开销。使用上，只需在 WXML 或 JavaScript 中调用翻译函数即可获得翻译文本。i18n 文本可以定义在任意位置，在构建过程中会被统一打包至指定路径。

## 文档

- [快速入门](./docs/quickstart.md)
- [接口文档](./docs/api.md)
- [Gulp插件配置文档](./docs/gulp.md)

## 安装

该方案目前需要依赖 Gulp 并且对源文件目录结构有一定的要求，需要确保小程序源文件放置在特定目录下（例如 src/ 目录）。

1. 首先在项目根目录运行以下命令安装 gulp 及 miniprogram-i18n 的 gulp 插件。

```
npm i -D gulp @miniprogram-i18n/gulp-locales-loader @miniprogram-i18n/gulp-wxml-transformer
```

2. 安装小程序国际化运行时。

```
npm i -S @miniprogram-i18n/core
```

3. 在项目根目录新建 gulpfile.js，并编写构建脚本，可参考 [examples/gulpfile.js](./examples/gulpfile.js)。具体配置详见 [Gulp插件配置文档](./docs/gulp.md)。

## 使用

### 定义 i18n

对所需翻译文本进行定义。例如在 `src/i18n/en-US.json` 中定义：

```
{
  "greeting": "hello {toWhom}!"
}
```

其他语言文本在相应语言文件下进行定义即可。

### 使用 i18n

定义好 i18n 文本之后，即可在 WXML 及 JavaScript 文件中使用了。

#### WXML

```html
<!-- src/pages/index/index.wxml -->
<view>{{ t('greeting', { toWhom: 'i18n' }) }}</view>
```

另外，需要在 WXML 对应的 JavaScript 文件中进行一些定义，这里以 Component 构造器为例。

```js
// src/pages/index/index.js
import { I18n } from '@miniprogram-i18n/core'

Component({
  behaviors: [I18n]
})
```

最终，实际运行时，以上 WXML 会被解析成如下片段并显示。

```
<view>hello i18n!</view>
```

### JavaScript

在 JavaScript 调用接口可能也有文本需要进行国际化处理，此时可以使用 i18n 接口进行文本翻译。

```js
// src/pages/index/index.js

Component({
  behaviors: [I18n],
  attached() {
    const text = this.t('greeting', { toWhom: 'JavaScript' })
    console.log(text)
  }
})
```

更多使用细节请参考以下文档：

- [快速入门](./docs/quickstart.md)

- [接口文档](./docs/api.md)
- [Gulp插件配置文档](./docs/gulp.md)

### 特性

目前 miniprogram-i18n 仅支持纯文本及文本插值，后续会对其他 i18n 特性进行支持。

#### 文本插值

```js
{
  "key": "Inserted value: {value}"
}
```

```js
i18n.t('key', { value: 'Hello!' })  // Inserted value: Hello!
```

为了方便调用深层嵌套的对象，当前支持使用 `.` 点语法来访问对象属性。

```json
{
   "dotted": "Nested value is: { obj.nested.value }"
}
```

```js
const value = {
  obj: {
    nested: {
      value: 'Catch you!'
    }
  }
}
i18n.t('dotted', value)  // Nested value is: Catch you!
```

其他尚未支持的特性有：

- Pseudo 字符串
- 单复数处理
- 条件判断 / 选择语句
- 日期、数字、货币处理
- 定义文件的命名空间
- 支持 WXML 与 JavaScript 独立定义

