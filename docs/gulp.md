# Gulp 插件配置文档
miniprogram-i18n 在构建阶段依赖两个 Gulp 插件，分别是 `@miniprogram-i18n/gulp-i18n-wxml` 和 `@miniprogram-i18n/gulp-i18n-locales`，`gulp-i18n-wxml` 负责转译 wxml 文件中的 i18n 自定义语法，`gulp-i18n-locales` 则负责合并 i18n 定义文件，并进行预处理生成运行时所需的文件。

> 若使用 CLI 进行构建，则可忽略 Gulp 构建的配置。

## 安装
因此在使用 i18n 的构建插件之前，需要先安装相关依赖。

```
npm i -D gulp @miniprogram-i18n/gulp-i18n-locales @miniprogram-i18n/gulp-i18n-wxml
```

依赖安装完成之后，需要建立 gulp 所需的配置并引入 i18n 构建插件。示例如下：
```js
const gulpWxmlTransformer = require('@miniprogram-i18n/gulp-i18n-wxml')
const gulpLocalesLoader = require('@miniprogram-i18n/gulp-i18n-locales')

function transpileWxml() {
  return src('src/**/*.wxml')
    .pipe(gulpWxmlTransformer())
    .pipe(dest('dist/'))
}
function mergeAndGenerateLocales() {
  return src('src/**/i18n/*.json')
    .pipe(gulpLocalesLoader({ defaultLocale: 'zh-CN', fallbackLocale: 'zh-CN' }))
    .pipe(dest('dist/i18n/'))
}
```

更详细的配置请参考 [examples](../examples/gulpfile.js)。

## gulp-i18n-wxml 配置
该构建函数支持如下参数：
```typescript
interface Options {
  wxsPath: string,
  wxsModuleName?: string,
  i18nFunctionName?: string,
}
```
- wxsPath
  
  指定 locales.wxs 所在路径，应与 gulp-i18n-locales 中的配置一致，默认为 `src/i18n/locales.wxs`。

- wxsModuleName
  
  指定 wxs 模块名称，默认为 `i18n`。

- i18nFunctionName
  
  指定 wxml 中的 i18n 函数名，默认为`t`，可修改为任意合法的函数名。

## gulp-i18n-locales 配置
该构建函数支持如下参数：
```typescript
interface Options {
  wxsFileName?: string
  jsFileName?: string
  defaultLocale?: string
  fallbackLocale?: string
}
```
- wxsFileName
  
  指定 locales wxs 文件名，需以 `.wxs` 作为后缀，默认为 `locales.wxs`。

- jsFileName

  指定 locales js 文件名，需以 `.js` 作为后缀，默认为`locales.js`。

- defaultLocale

  指定默认语言，默认为 `en-US`。该值需与 i18n 定义文件名对应。

- fallbackLocale

  指定备选语言，默认为 `en-US`。该值需与 i18n 定义文件名对应。在运行时无法找到对应语言下的文本时，会从备选语言中进行查找。**注：该值无法在运行进行修改。**

