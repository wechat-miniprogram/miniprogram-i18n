import { I18nModuleName, TranslationFunctionTransformer, LocaleVariable } from '../../transformer/translation-function-transformer'

const tt = I18nModuleName.default + '.' + 't'
const l = LocaleVariable.default

const testCases = [
  {
    name: 'transform value in tag content',
    input: `<view>hello, {{t('key')}}!</view>`,
    expected: `<view>hello, {{${tt}('key', ${l})}}!</view>`,
  },
  {
    name: 'transform value in tag attribute',
    input: `<view data-value="{{ t('value') }}">hello</view>`,
    expected: `<view data-value="{{ ${tt}('value', ${l}) }}">hello</view>`,
  },
  {
    name: 'transform value in both tag attribute and text content',
    input: `<view data-value="{{ t('value') }}">hello, {{t('value2')}}</view>`,
    expected: `<view data-value="{{ ${tt}('value', ${l}) }}">hello, {{${tt}('value2', ${l})}}</view>`,
  },
  {
    name: 'transform multiple t func',
    input: `<view data-value="{{ t('value')+t('value2') }}">{{t('key1') + t('key2') + t('key3')}}</view>`,
    expected: `<view data-value="{{ ${tt}('value', ${l})+${tt}('value2', ${l}) }}">{{${tt}('key1', ${l}) + ${tt}('key2', ${l}) + ${tt}('key3', ${l})}}</view>`,
  },
  {
    name: 'transform multiple t func 2',
    input: `<view data-value="{{ t('value') }}" data-info="{{ t('value2') }}"></view>`,
    expected: `<view data-value="{{ ${tt}('value', ${l}) }}" data-info="{{ ${tt}('value2', ${l}) }}"></view>`,
  },
  {
    name: 'transform in nested tags',
    input: `<view data-value="{{ t('value') }}">a{{t()}}b<view>c{{t()}}d</view>e{{ t() }}f</view>`,
    expected: `<view data-value="{{ ${tt}('value', ${l}) }}">a{{${tt}(${l})}}b<view>c{{${tt}(${l})}}d</view>e{{ ${tt}(${l}) }}f</view>`,
  },
  {
    name: 'transform t func inside js object in text',
    input: `<view>{{ t('key', { t: t('key2') }) }}</view>`,
    expected: `<view>{{ ${tt}('key', { t: ${tt}('key2', ${l}) }, ${l}) }}</view>`,
  },
  {
    name: 'transform t func inside js object in attributes',
    input: `<view data-test="{{ t('key', { t: t('key2') }) }}"></view>`,
    expected: `<view data-test="{{ ${tt}('key', { t: ${tt}('key2', ${l}) }, ${l}) }}"></view>`,
  },
  {
    name: 'do not transform t func in object',
    input: `<view data-test="{{ test.t('key', { t: test.t('key2') }) }}"></view>`,
    expected: `<view data-test="{{ test.t('key', { t: test.t('key2') }) }}"></view>`,
  },
]

testCases.forEach(testCase => {
  test(`Transformer: ${testCase.name}`, () => {
    const source = testCase.input
    const transfomer = new TranslationFunctionTransformer()
    const newSource = transfomer.transform(source)
    expect(newSource).toEqual(testCase.expected)
  })
})
