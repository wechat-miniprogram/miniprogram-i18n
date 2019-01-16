import path from 'path'
import File from 'vinyl'
import gulp from 'gulp'
import gulpI18nLocalesLoader from '..'

const fixtures = function(glob: string) { return path.join(__dirname, 'fixtures', glob) }


test('should ignore empty file', (done) => {
  const stream = gulpI18nLocalesLoader()
  const emptyFile = {
    isNull: () => true,
  }
  stream.on('data', (data) => {
    expect(data).toBe(emptyFile)
    done()
  })
  stream.write(emptyFile)
})

test('should merge json file', (done) => {
  gulp.src(fixtures('**/i18n/*.json'))
    .pipe(gulpI18nLocalesLoader())
    .on('data', (data) => {
      const d = data.contents.toString('utf-8')
      expect(d.length > 0).toBeTruthy()
      done()
    })
    .once('error', (err) => {
      console.error(err)
    })
})

test('should emit two files', (done) => {
  let cnt = 0
  gulp.src(fixtures('**/i18n/*.json'))
    .pipe(gulpI18nLocalesLoader())
    .on('data', (data) => {
      expect(data.path.includes('locales')).toBeTruthy()
      if (++cnt === 2) done()
    })
    .once('error', (err) => {
      console.error(err)
    })
})
