const { src, dest, series } = require('gulp');
const gulpI18nWxml = require('@miniprogram-i18n/gulp-i18n-wxml')
const gulpI18nLocales = require('@miniprogram-i18n/gulp-i18n-locales')

function mergeAndGenerateLocales() {
  return src('src/**/i18n/*.json')
    .pipe(gulpI18nLocales({ defaultLocale: 'zh-CN', fallbackLocale: 'zh-CN' }))
    .pipe(dest('dist/i18n/'))
}

function transpileWxml() {
  return src('src/**/*.wxml')
    .pipe(gulpI18nWxml())
    .pipe(dest('dist/'))
}

function copyToDist() {
  return src(['src/**/*', '!src/**/*.wxml', '!src/**/i18n/*.json'])
    .pipe(dest('dist/'))
}

exports.default = series(copyToDist, transpileWxml, mergeAndGenerateLocales);
