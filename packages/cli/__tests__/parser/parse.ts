import { TranslationBlockParser } from '../../src/parser/parse'

test('parse basic t func', () => {
  const source = `{{ t() }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse multiple translation block', () => {
  const source = `{{t()}} {{ t( ) }} {{ t() }}{{t()}}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse t with single quote string', () => {
  const source = `{{ t('key', { value: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse t with single quote string and escaped single quote', () => {
  const source = `{{ t('key', { value: 'val\' escaped' }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse t with double quote string', () => {
  const source = `{{ t("key", { value: "val" }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse t with template quote string', () => {
  const source = '{{ t(`key`, { value: `val`}) }}'
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse with double curly brace inside key', () => {
  const source = `{{ t('{{key}}', { p: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse with double curly barce inside value', () => {
  const source = `{{ t('key', { p: '{{val}}' }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse with double curly barce mismachted inside value', () => {
  const source = `{{ t('key', { p: '{{{{{val}}}}}' }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse with js type inside value', () => {
  const source = `{{ t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse with nested object inside value', () => {
  const source = `{{ t('key', { val: { m: [], n: { m: { h: 'str' }}}}) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})

test('parse with t function in value field', () => {
  const source = `{{ t('key', { v: t('key2') }) }}`
  const parser = new TranslationBlockParser(source)
  parser.parse()
})
