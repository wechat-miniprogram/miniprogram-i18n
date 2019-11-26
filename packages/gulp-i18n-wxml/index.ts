import path from 'path'
import { TranslationFunctionTransformer,  TranslationFunction, I18nModuleName } from '@miniprogram-i18n/compile'
import through from 'through2'
import File from 'vinyl'
import PluginError from 'plugin-error'

const PLUGIN_NAME = '@miniprogram-i18n/gulp-i18n-wxml'

// Assume source folder is src
const DEFAULT_WXS_PATH = path.resolve('src/i18n/locales.wxs')

interface Options {
  wxsPath: string,
  wxsModuleName?: string,
  i18nFunctionName?: string,
}

const getWxsTag = (path: string, moduleName: string) => `<wxs src="${path}" module="${moduleName}" />\n`

const gulpI18nWxmlTransformer = (options?: Options) => through.obj((file: File, _, cb) => {
  const opts = options || { wxsPath: '', wxsModuleName: '', i18nFunctionName: '' }
  const wxsPath = opts.wxsPath || DEFAULT_WXS_PATH
  const wxsModuleName = opts.wxsModuleName || I18nModuleName.default
  const i18nFunctionName = opts.i18nFunctionName || TranslationFunction.default

  // Ignore empty file or not wxml files
  if (file.isNull() || path.extname(file.path) !== '.wxml') {
    return cb(null, file)
  }
  if (file.isStream()) {
    return cb(new PluginError(PLUGIN_NAME, 'Streaming data is not supported'))
  }
  // TODO: read functionn name from options
  const transfomer = new TranslationFunctionTransformer(i18nFunctionName, wxsModuleName)
  if (!file.contents) {
    return cb(null, file)
  }
  try {
    const transformedContents = transfomer.transform(file.contents.toString('utf-8'))
    const relativeWxsPath = path.relative(path.dirname(file.path), wxsPath)
    const wxsTag = getWxsTag(relativeWxsPath, wxsModuleName)
    file.contents = Buffer.concat([Buffer.from(wxsTag), Buffer.from(transformedContents)])
  } catch (err) {
    console.log('error:', err)
    return cb(new PluginError(PLUGIN_NAME, err))
  }
  return cb(null, file)
})

export default gulpI18nWxmlTransformer
