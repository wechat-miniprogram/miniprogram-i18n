import { I18nTranslationFunctionName, TranslationFunctionTransformer } from '../../transformer/translation-function-transformer'

const tt = I18nTranslationFunctionName.default

const testCases = [
  {
    name: 'transform value in tag content',
    input: `<view>hello, {{t('key')}}!</view>`,
    expected: `<view>hello, {{${tt}('key')}}!</view>`,
  },
  {
    name: 'transform value in tag attribute',
    input: `<view data-value="{{ t('value') }}">hello</view>`,
    expected: `<view data-value="{{ ${tt}('value') }}">hello</view>`,
  },
  {
    name: 'transform value in both tag attribute and text content',
    input: `<view data-value="{{ t('value') }}">hello, {{t('value2')}}</view>`,
    expected: `<view data-value="{{ ${tt}('value') }}">hello, {{${tt}('value2')}}</view>`,
  },
  {
    name: 'transform multiple t func',
    input: `<view data-value="{{ t('value')+t('value2') }}">{{t('key1') + t('key2') + t('key3')}}</view>`,
    expected: `<view data-value="{{ ${tt}('value')+${tt}('value2') }}">{{${tt}('key1') + ${tt}('key2') + ${tt}('key3')}}</view>`,
  },
  {
    name: 'transform multiple t func 2',
    input: `<view data-value="{{ t('value') }}" data-info="{{ t('value2') }}"></view>`,
    expected: `<view data-value="{{ ${tt}('value') }}" data-info="{{ ${tt}('value2') }}"></view>`,
  },
  {
    name: 'transform in nested tags',
    input: `<view data-value="{{ t('value') }}">a{{t()}}b<view>c{{t()}}d</view>e{{ t() }}f</view>`,
    expected: `<view data-value="{{ ${tt}('value') }}">a{{${tt}()}}b<view>c{{${tt}()}}d</view>e{{ ${tt}() }}f</view>`,
  },
  {
    name: 'transform t func inside js object in text',
    input: `<view>{{ t('key', { t: t('key2') }) }}</view>`,
    expected: `<view>{{ ${tt}('key', { t: ${tt}('key2') }) }}</view>`,
  },
  {
    name: 'transform t func inside js object in attributes',
    input: `<view data-test="{{ t('key', { t: t('key2') }) }}"></view>`,
    expected: `<view data-test="{{ ${tt}('key', { t: ${tt}('key2') }) }}"></view>`,
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
