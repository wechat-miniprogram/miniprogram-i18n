const fs = require('fs')
const path = require('path')
const { src, dest, series } = require('gulp');
const gulpI18nWxml = require('../packages/gulp-i18n-wxml/dist/bundle')
const mergeJSON = require('gulp-merge-json')
const parse = require('format-message-parse')
const insert = require('gulp-insert')

function getWxsCode() {
  const code = fs.readFileSync('../packages/core/dist/wxs.js', 'utf-8')
  const runner = `module.exports.t = Interpreter.getMessageInterpreter(translations)`
  return ['', code, runner].join('\n')
}

function parseJSONField(object) {
  const keys = Object.keys(object)
  for (const key of keys) {
    const val = object[key]
    if (typeof val === 'string') {
      object[key] = parse(val)
    }
    if (typeof val === 'object') {
      object[key] = parseJSONField(val)
    }
  }
  return object
}

function mergeI18nJsonFilesToWxs() {
  return src(['src/**/i18n/*.json'])
    .pipe(mergeJSON({
      fileName: 'locales.wxs',
      edit: (obj, file) => {
        const p = file.path
        const basename = path.basename(p)
        const fileName = basename.split('.')[0]
        return { [fileName]: parseJSONField(obj) }
      },
      exportModule: 'var translations'
    }))
    .pipe(insert.append(getWxsCode()))
    .pipe(dest('dist/i18n'))
}

function mergeI18nJsonFilesToJS() {
  return src(['src/**/i18n/*.json'])
    .pipe(mergeJSON({
      fileName: 'locales.js',
      edit: (obj, file) => {
        const p = file.path
        const basename = path.basename(p)
        const fileName = basename.split('.')[0]
        return { [fileName]: parseJSONField(obj) }
      },
      exportModule: 'module.exports'
    }))
    .pipe(dest('dist/i18n'))
}

function transpileWxml() {
  return src('src/**/*.wxml')
    .pipe(gulpI18nWxml({ wxsPath: 'src/i18n/locales.wxs' }))
    .pipe(dest('dist/'));
}

function copyToDist() {
  return src(['src/**/*', '!src/**/*.wxml', '!src/**/i18n/*.json'])
    .pipe(dest('dist/'))
}

exports.default = series(copyToDist, transpileWxml, mergeI18nJsonFilesToWxs, mergeI18nJsonFilesToJS);
