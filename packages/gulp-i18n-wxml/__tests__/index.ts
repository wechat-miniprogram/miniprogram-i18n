import path from 'path'
import File from 'vinyl'
import gulpI18nWxmlTransformer from '..'
import { TranslationFunctionTransformer } from '@miniprogram-i18n/compile'

const createFile = function(filepath: string, contents: Buffer) {
  const base = path.dirname(filepath)
  return new File({
    path: filepath,
    base: base,
    cwd: path.dirname(base),
    contents: contents,
  })
}

test('should ignore empty file', (done) => {
  const stream = gulpI18nWxmlTransformer()
  const emptyFile = {
    isNull: () => true,
  }
  stream.on('data', (data) => {
    expect(data).toBe(emptyFile)
    done()
  })
  stream.write(emptyFile)
})

test('should transform wxml files', (done) => {
  const wxmlContent = '<view>{{ t("key") }}</view>'
  const filepath = '/test/file.wxml'
  const contents = Buffer.from(wxmlContent)

  const stream = gulpI18nWxmlTransformer()
  stream
    .on('error', done)
    .on('data', (data: File) => {

      expect(data.contents!.toString()).toEqual(
        new TranslationFunctionTransformer().transform(wxmlContent),
      )
      done()
    })
    .write(createFile(filepath, contents))
})
