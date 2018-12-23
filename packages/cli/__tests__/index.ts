import path from 'path'
import { validateI18nConfig } from '../src'

test('validateI18nConfig: config file should be valid', () => {
  const ret = validateI18nConfig({
    defaultLocale: 'zh-CN',
    locales: ['en-US', 'zh-CN'],
    fallbackLocale: 'en-US',
    localeFolder: './fixtures/i18n',
  })
  expect(ret).toHaveLength(0)
})
