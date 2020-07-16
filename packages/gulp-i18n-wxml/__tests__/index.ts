import path from 'path'
import File from 'vinyl'
import gulpI18nWxmlTransformer from '..'
import { TranslationFunctionTransformer, I18nModuleName } from '@miniprogram-i18n/compile'

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
  const stream = gulpI18nWxmlTransformer({ wxsPath: 'test/module.wxs' })
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
  const filepath = 'test/file.wxml'
  const contents = Buffer.from(wxmlContent)
  const transpiled = new TranslationFunctionTransformer().transform(wxmlContent, filepath)

  const wxsPath = 'i18n/module.wxs'
  const stream = gulpI18nWxmlTransformer({ wxsPath })
  stream
    .on('error', done)
    .on('data', (data: File) => {
      expect(data.contents!.toString()).toEqual(
        `<wxs src="../i18n/module.wxs" module="${I18nModuleName.default}" />\n` + transpiled,
      )
      done()
    })
    .write(createFile(filepath, contents))
})

test('customized translation function', (done) => {
  const wxmlContent = '<view>{{ _("key") }}</view>'
  const filepath = 'test/file.wxml'
  const contents = Buffer.from(wxmlContent)
  const transpiled = new TranslationFunctionTransformer('_', 'mpi18n').transform(wxmlContent, filepath)

  const wxsPath = 'i18n/module.wxs'
  const stream = gulpI18nWxmlTransformer({ wxsPath, wxsModuleName: 'mpi18n', i18nFunctionName: '_' })
  stream
    .on('error', done)
    .on('data', (data: File) => {
      expect(data.contents!.toString()).toEqual(
        `<wxs src="../i18n/module.wxs" module="mpi18n" />\n` + transpiled,
      )
      done()
    })
    .write(createFile(filepath, contents))
})
