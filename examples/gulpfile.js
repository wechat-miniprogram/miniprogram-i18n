const { src, dest, series } = require('gulp');
const gulpI18nWxml = require('../packages/gulp-i18n-wxml/dist/bundle')

function copyToDist() {
  return src(['src/**/*', '!src/**/*.wxml'])
    .pipe(dest('dist/'))
}

function transpileWxml() {
  return src('src/**/*.wxml')
    .pipe(gulpI18nWxml({ wxsPath: 'src/i18n/locales.wxs' }))
    .pipe(dest('dist/'));
}

exports.default = series(copyToDist, transpileWxml);
