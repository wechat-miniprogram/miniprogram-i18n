import fs from 'fs'
import path from 'path'
import File from 'vinyl'
import through from 'through2'
import PluginError from 'plugin-error'
import { parseTranslation } from '@miniprogram-i18n/compile'

const PLUGIN_NAME = '@miniprogram-i18n/gulp-locales-loader'

const DEFAULT_WXS_FILENAME = 'locales.wxs'
const DEFAULT_JS_FILENAME = 'locales.js'

const DEFAULT_LOCALE = 'en-US'
const DEFAULT_FALLBACK_LOCALE = 'en-US'

const CORE_PATH = path.dirname(require.resolve('@miniprogram-i18n/core/package.json'))

function getWxsCode() {
  const code = fs.readFileSync(path.join(CORE_PATH, '/dist/wxs.js'), 'utf-8')
  // FIXME: function name maybe mangled
  const runner = `module.exports.t = Interpreter.getMessageInterpreter(translations)`
  return [code, runner].join('\n')
}

interface Options {
  wxsFileName?: string
  jsFileName?: string
  defaultLocale?: string
  fallbackLocale?: string
}

let firstFile: File
const localeFile: any = {}

type Callback = (...args: any[]) => void

function parseTranslations(object: any) {
  const keys = Object.keys(object)
  for (const key of keys) {
    const val = object[key]
    if (typeof val === 'string') {
      object[key] = parseTranslation(val)
    }
    if (typeof val === 'object') {
      object[key] = parseTranslation(val)
    }
  }
  return object
}

const gulpI18nLocalesLoader = (options?: Options) => {
  if (!options) options = {}

  function buffer(file: File, _: any, cb: Callback) {
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

    if (!firstFile) firstFile = file

    const basename = path.basename(file.path)
    const localeName = basename.split('.')[0]

    let content = null
    try {
      content = JSON.parse(file.contents.toString('utf-8'))

      if (!localeFile[localeName]) localeFile[localeName] = {}
      localeFile[localeName] = Object.assign({}, localeFile[localeName], parseTranslations(content))
    } catch (err) {
      return cb(new PluginError(PLUGIN_NAME, err))
    }

    cb()
  }

  function endStream(cb: Callback) {
    if (!firstFile) return cb()

    const wxsFileName = options && options.wxsFileName || DEFAULT_WXS_FILENAME
    const jsFileName = options && options.jsFileName || DEFAULT_JS_FILENAME

    const localeString = JSON.stringify(localeFile)
    const defaultLocale = options && options.defaultLocale || DEFAULT_LOCALE
    const fallbackLocale = options && options.fallbackLocale || DEFAULT_FALLBACK_LOCALE
    const wxsContent = `var fallbackLocale=${fallbackLocale};var translations=${localeString};\n${getWxsCode()}`

    // FIXME: fix fallback locale
    const jsContent = `module.exports.fallbackLocale='${fallbackLocale}';module.exports.defaultLocale='${defaultLocale}';module.exports.translations=${localeString};`

    const wxsFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, wxsFileName),
      contents: Buffer.from(wxsContent),
    })

    const jsFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, jsFileName),
      contents: Buffer.from(jsContent),
    })

    this.push(wxsFile)
    this.push(jsFile)
    cb()
  }

  return through.obj(buffer, endStream)

}

export default gulpI18nLocalesLoader
