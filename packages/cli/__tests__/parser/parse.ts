import { TranslationBlockParser } from '../../src/parser/parse'

test('parse basic t func', () => {
  const source = `{{ t() }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(' t() ')
})

test('parse multiple translation block', () => {
  const source = `{{t()}} {{ t( ) }} {{ t() }}{{t()}}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(4)
  expect(stmts[0].statement).toEqual('t()')
  expect(stmts[1].statement).toEqual(' t( ) ')
  expect(stmts[2].statement).toEqual(' t() ')
  expect(stmts[3].statement).toEqual('t()')
})

test('parse t with single quote string', () => {
  const source = `{{ t('key', { value: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { value: 'val' }) `)
})

test('parse t with single quote string and escaped single quote', () => {
  const source = `{{ t('key', { value: 'val\\\' escaped' }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { value: 'val\\' escaped' }) `)
})

test('parse t with double quote string and escaped double quote', () => {
  const source = `{{ t('key', { value: "val\\\" escaped" }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { value: "val\\" escaped" }) `)
})

test('parse t with backtick string and escaped backtick', () => {
  const source = '{{ t("key", { value: `val\\\` escaped` }) }}'
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(' t("key", { value: `val\\` escaped` }) ')
})

test('parse t with double quote string', () => {
  const source = `{{ t("key", { value: "val" }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(' t("key", { value: "val" }) ')
})

test('parse t with backtick string', () => {
  const source = '{{ t(`key`, { value: `val`}) }}'
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(' t(`key`, { value: `val`}) ')
})

test('parse with double curly brace inside key', () => {
  const source = `{{ t('{{key}}', { p: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('{{key}}', { p: 'val' }) `)
})

test('parse with double curly barce inside value', () => {
  const source = `{{ t('key', { p: '{{val}}' }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { p: '{{val}}' }) `)
})

test('parse with double curly barce mismachted inside value', () => {
  const source = `{{ t('key', { p: '{{{{{val}}}}}' }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { p: '{{{{{val}}}}}' }) `)
})

test('parse with js type inside value', () => {
  const source = `{{ t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) `)
})

test('parse with nested object inside value', () => {
  // nested object may also contains double close braces
  const source = `{{ t('key', { val: { m: [], n: { m: { h: 'str' }}}}) t('abc') }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { val: { m: [], n: { m: { h: 'str' }}}}) t('abc') `)
})

test('parse with t function in value field', () => {
  const source = `{{ t('key', { v: t('key2') }) }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` t('key', { v: t('key2') }) `)
})

test('WXS: parser should ignore everything inside <wxs></wxs>', () => {
  const source = `<wxs module="xxx"> {{ t() }} </wxs><wxs>{{ k() }}</wxs><wxs/>`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('WXS: parser should identify self-closing WXS tag <wxs/>', () => {
  const source = `<wxs/>`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('WXS: parser should have no ambiguity', () => {
  let source = `<wxs module="</wxs>"> {{ t() }} </wxs>`
  let parser = new TranslationBlockParser(source)
  let stmts = parser.parse()
  expect(stmts).toHaveLength(0)
  source = `<wxs module='</wxs>'> {{ t() }} </wxs>`
  parser = new TranslationBlockParser(source)
  stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('WXS: should allow space in tag', () => {
  const source = `<  wxs module="test" > {{ t() }} </ wxs  >`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('WXS: should allow uppercase tag', () => {
  const source = `<WXS module="test"> {{ t() }} </WXS>`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('WXS: should not affect other blocks', () => {
  const source = `{{ k() }} <wxs module="test"> {{ t() }} </wxs> {{ t() }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(2)
})

test('WXS: should not identify tags other than WXS', () => {
  const source = `<view>{{ t() }}</view><wxs></wxs>`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
})

test('WXS: should throw error when WXS tag is invalid', () => {
  const source = `<wxs><view>{{ t() }}</view>`
  const parser = new TranslationBlockParser(source)
  expect(() => {
    parser.parse()
  }).toThrow()
})

test('bad case: parse with empty block', () => {
  const source = `{{}}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('bad case: parse with one space block', () => {
  const source = `{{ }}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(1)
  expect(stmts[0].statement).toEqual(` `)
})

test('bad case: parse with only left brace', () => {
  const source = `{{`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('bad case: parse with only right brace', () => {
  const source = `}}`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
})

test('bad case: parse with only one brace', () => {
  const source = `{`
  const parser = new TranslationBlockParser(source)
  const stmts = parser.parse()
  expect(stmts).toHaveLength(0)
  const source2 = `}`
  const parser2 = new TranslationBlockParser(source2)
  const stmts2 = parser.parse()
  expect(stmts2).toHaveLength(0)
})
