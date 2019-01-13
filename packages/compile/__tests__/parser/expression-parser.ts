import TranslationBlockParser from '../../parser/expression-parser'

test('parse basic t func', () => {
  const source = `{{ t() }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t() ')
  expect(callExpression).toHaveLength(1)
})

test('parse basic t func with other expressions', () => {
  const source = `abc + {{ t() }} + def`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t() ')
  expect(callExpressions).toHaveLength(1)
})

test('parse basic t func with multiple expressions inside', () => {
  const source = `{{ t() +t2() + t3() }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t() +t2() + t3() ')
  expect(callExpression).toHaveLength(3)
})

test('parse basic t func with wxs calls', () => {
  const source = `{{ t() + wxs.t() + t3() }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t() + wxs.t() + t3() ')
  expect(callExpression).toHaveLength(2)
})

test('parse multiple translation block', () => {
  const source = `{{t()}} {{ t( ) }} {{ t() }}{{t()}}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(4)
  expect(expression[0].expression).toEqual('t()')
  expect(expression[1].expression).toEqual(' t( ) ')
  expect(expression[2].expression).toEqual(' t() ')
  expect(expression[3].expression).toEqual('t()')
  expect(callExpression).toHaveLength(4)
})

test('parse t with single quote string', () => {
  const source = `{{ t('key', { value: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { value: 'val' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse t with single quote string and escaped single quote', () => {
  const source = `{{ t('key', { value: 'val\\\' escaped' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { value: 'val\\' escaped' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse t with double quote string and escaped double quote', () => {
  const source = `{{ t('key', { value: "val\\\" escaped" }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { value: "val\\" escaped" }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse t with backtick string and escaped backtick', () => {
  const source = '{{ t("key", { value: `val\\\` escaped` }) }}'
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t("key", { value: `val\\` escaped` }) ')
  expect(callExpression).toHaveLength(1)
})

test('parse t with double quote string', () => {
  const source = `{{ t("key", { value: "val" }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t("key", { value: "val" }) ')
  expect(callExpression).toHaveLength(1)
})

test('parse t with backtick string', () => {
  const source = '{{ t(`key`, { value: `val`}) }}'
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(' t(`key`, { value: `val`}) ')
  expect(callExpression).toHaveLength(1)
})

test('parse with double curly brace inside key', () => {
  const source = `{{ t('{{key}}', { p: 'val' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('{{key}}', { p: 'val' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with double curly barce inside value', () => {
  const source = `{{ t('key', { p: '{{val}}' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { p: '{{val}}' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with double curly barce mismachted inside value', () => {
  const source = `{{ t('key', { p: '{{{{{val}}}}}' }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { p: '{{{{{val}}}}}' }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with js type inside value', () => {
  const source = `{{ t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { i: true, j: false, k: [], m: {}, n: undefined, h: null }) `)
  expect(callExpression).toHaveLength(1)
})

test('parse with nested object inside value', () => {
  // nested object may also contains double close braces
  const source = `{{ t('key', { val: { m: [], n: { m: { h: 'str' }}}}) t('abc') }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { val: { m: [], n: { m: { h: 'str' }}}}) t('abc') `)
  expect(callExpression).toHaveLength(2)
})

test('parse deeply nested t function', () => {
  // nested object may also contains double close braces
  const source = `{{ t('key', { val: { n: t(k2), m: t('k3', { j: t('k4') }), n: 'v' }}) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { val: { n: t(k2), m: t('k3', { j: t('k4') }), n: 'v' }}) `)
  expect(callExpressions).toHaveLength(1)
  expect(callExpressions[0].childFunctionExpressions).toHaveLength(2)
})

test('parse with t function in value field', () => {
  const source = `{{ t('key', { v: t('key2') }) }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` t('key', { v: t('key2') }) `)
  expect(callExpression).toHaveLength(1)
  expect(callExpression[0].childFunctionExpressions).toHaveLength(1)
})

test('bad case: parse with empty block', () => {
  const source = `{{}}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with one space block', () => {
  const source = `{{ }}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(1)
  expect(expression[0].expression).toEqual(` `)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with only left brace', () => {
  const source = `{{`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with only right brace', () => {
  const source = `}}`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
})

test('bad case: parse with only one brace', () => {
  const source = `{`
  const parser = new TranslationBlockParser(source)
  const { expression, callExpressions: callExpression } = parser.parse()
  expect(expression).toHaveLength(0)
  expect(callExpression).toHaveLength(0)
  const source2 = `}`
  const parser2 = new TranslationBlockParser(source2)
  const { expression: expression2, callExpressions: callExpression2 } = parser2.parse()
  expect(expression2).toHaveLength(0)
  expect(callExpression2).toHaveLength(0)
})
