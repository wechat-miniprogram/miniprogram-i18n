import path from 'path'
import { TranslationFunctionTransformer } from '@miniprogram-i18n/compile'
import through from 'through2'
import File from 'vinyl'
import PluginError from 'plugin-error'

const PLUGIN_NAME = 'gulp-i18n-wxml-transformer'

const gulpI18nWxmlTransformer = (options?: object) => through.obj((file: File, _, cb) => {
  // Ignore empty file or not wxml files
  if (file.isNull() || path.extname(file.path) !== '.wxml') {
    return cb(null, file)
  }
  if (file.isStream()) {
    return cb(new PluginError(PLUGIN_NAME, 'Streaming data is not supported'))
  }
  // TODO: read functionn name from options
  const transfomer = new TranslationFunctionTransformer()
  if (!file.contents) {
    return cb(null, file)
  }
  try {
    const transformedContents = transfomer.transform(file.contents.toString('utf-8'))
    file.contents = Buffer.from(transformedContents)
    return cb(null, file)
  } catch (err) {
    return cb(new PluginError(PLUGIN_NAME, err))
  }
})

export = gulpI18nWxmlTransformer
