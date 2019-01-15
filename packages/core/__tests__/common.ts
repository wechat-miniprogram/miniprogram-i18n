import { lookUpAST } from '../common'

test('Common: lookUpAST', () => {
  const translations = {
    'en-US': {
      test: 'test',
    },
    'zh-CN': {
      test: '测试',
    },
  }
  const locale = 'en-US'
  const fallbackLocale = 'zh-CN'
  const translated = lookUpAST('test', translations, locale, fallbackLocale)
  expect(translated).toEqual('test')
})

test('Common: lookUpAST fallback and fallback exists', () => {
  const translations = {
    'zh-CN': {
      test: '测试',
    },
  }
  const locale = 'en-US'
  const fallbackLocale = 'zh-CN'
  const translated = lookUpAST('test', translations, locale, fallbackLocale)
  expect(translated).toEqual('测试')
})

test('Common: lookUpAST fallback and fallback not exist', () => {
  const translations = {
    'zh-CN': {
      test: '测试',
    },
  }
  const locale = 'en-US'
  const fallbackLocale = 'zh-CN'
  const translated = lookUpAST('key', translations, locale, fallbackLocale)
  expect(translated).toEqual('key')
})

test('Common: lookUpAST message definition not found', () => {
  const translations = {
    'en-US': {
      test: 'test',
    },
  }
  const locale = 'en-US'
  const fallbackLocale = 'zh-CN'
  const translated = lookUpAST('key', translations, locale, fallbackLocale)
  expect(translated).toEqual('key')
})
