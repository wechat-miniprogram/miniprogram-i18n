import path from 'path'
import { validateI18nConfig, loadLocaleFiles } from '../src'

test('validateI18nConfig: config file should be valid', () => {
  const ret = validateI18nConfig({
    defaultLocale: 'zh-CN',
    locales: ['en-US', 'zh-CN'],
    fallbackLocale: 'en-US',
    localeFolder: './fixtures/i18n',
  })
  expect(ret).toBeTruthy()
  expect(validateI18nConfig({} as any)).toBeFalsy()
})

test('loadLocaleFiles: should get files', async () => {
  const localeList = ['en-US', 'zh-CN']
  const locales = await loadLocaleFiles(path.join(path.dirname(__filename), '/fixtures/config/i18n'), localeList)
  expect((locales.get(localeList[0]) as any).testkey).toEqual('testval')
  expect((locales.get(localeList[1]) as any).testkey).toEqual('测试')
})
