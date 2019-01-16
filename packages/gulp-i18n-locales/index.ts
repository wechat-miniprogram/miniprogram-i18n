import path from 'path'
import File from 'vinyl'
import through from 'through2'
import PluginError from 'plugin-error'

const PLUGIN_NAME = '@miniprogram-i1n8/gulp-i18n-locales'

interface Options {}

const gulpI18nWxmlTransformer = (options?: Options) => through.obj((file: File, _, cb) => {
  const opts = options
  // const wxsPath = opts.wxsPath
  // if (!wxsPath) {
  //   return cb(new PluginError(PLUGIN_NAME, 'wxsPath is required'))
  // }

  // Ignore empty file or not json files
  if (file.isNull() || path.extname(file.path) !== '.json') {
    return cb(null, file)
  }
  if (file.isStream()) {
    return cb(new PluginError(PLUGIN_NAME, 'Streaming data is not supported'))
  }
  if (!file.contents) {
    return cb(null, file)
  }
  return cb(null, file)
})

export default gulpI18nWxmlTransformer
