const { src, dest, series } = require('gulp');
const gulpI18nWxml = require('../packages/gulp-i18n-wxml/dist/bundle')
const gulpI18nLocales = require('../packages/gulp-i18n-locales/dist/bundle')

function mergeAndGenerateLocales() {
  return src('src/**/i18n/*.json')
    .pipe(gulpI18nLocales())
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
