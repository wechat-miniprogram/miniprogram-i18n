import TranslationBlockParser from '../../src/parser/expression-parser'

test('parse basic t func', () => {
  const source = `{{ t() }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(' t() ')
  expect(callExpression).toHaveLength(1)
})

test('parse multiple translation block', () => {
  const source = `{{t()}} {{ t( ) }} {{ t() }}{{t()}}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(4)
  expect(expression[0].statement).toEqual('t()')
  expect(expression[1].statement).toEqual(' t( ) ')
  expect(expression[2].statement).toEqual(' t() ')
  expect(expression[3].statement).toEqual('t()')
  expect(callExpression).toHaveLength(4)
})

test('parse t with single quote string', () => {
  const source = `{{ t('key', { value: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { value: 'val' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse t with single quote string and escaped single quote', () => {
  const source = `{{ t('key', { value: 'val\\\' escaped' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { value: 'val\\' escaped' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse t with double quote string and escaped double quote', () => {
  const source = `{{ t('key', { value: "val\\\" escaped" }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { value: "val\\" escaped" }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse t with backtick string and escaped backtick', () => {
  const source = '{{ t("key", { value: `val\\\` escaped` }) }}'
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(' t("key", { value: `val\\` escaped` }) ')
  expect(callExpression).toHaveLength(1)
})

test('parse t with double quote string', () => {
  const source = `{{ t("key", { value: "val" }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(' t("key", { value: "val" }) ')
  expect(callExpression).toHaveLength(1)
})

test('parse t with backtick string', () => {
  const source = '{{ t(`key`, { value: `val`}) }}'
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(' t(`key`, { value: `val`}) ')
  expect(callExpression).toHaveLength(1)
})

test('parse with double curly brace inside key', () => {
  const source = `{{ t('{{key}}', { p: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('{{key}}', { p: 'val' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with double curly barce inside value', () => {
  const source = `{{ t('key', { p: '{{val}}' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { p: '{{val}}' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with double curly barce mismachted inside value', () => {
  const source = `{{ t('key', { p: '{{{{{val}}}}}' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { p: '{{{{{val}}}}}' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with js type inside value', () => {
  const source = `{{ t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with nested object inside value', () => {
  // nested object may also contains double close braces
  const source = `{{ t('key', { val: { m: [], n: { m: { h: 'str' }}}}) t('abc') }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { val: { m: [], n: { m: { h: 'str' }}}}) t('abc') `)
  expect(callExpression).toHaveLength(2)
})

test('parse with t function in value field', () => {
  const source = `{{ t('key', { v: t('key2') }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` t('key', { v: t('key2') }) `)
  expect(callExpression).toHaveLength(2)
})

test('bad case: parse with empty block', () => {
  const source = `{{}}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with one space block', () => {
  const source = `{{ }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].statement).toEqual(` `)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with only left brace', () => {
  const source = `{{`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with only right brace', () => {
  const source = `}}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with only one brace', () => {
  const source = `{`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
  const source2 = `}`
  const parser2 = new TranslationBlockParser(source2)
  const { expression: expression2, callExpression: callExpression2 } = parser2.parse()
  expect(expression2).toHaveLength(0)
  expect(callExpression2).toHaveLength(0)
})
