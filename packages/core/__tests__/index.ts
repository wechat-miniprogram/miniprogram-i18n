import { I18nRuntime } from '../src'

test('I18nRuntime: basic interpolation test', () => {
  const localeData = {
    'en-US': {
      greeting: 'Hello {name}!',
    },
    'zh-CN': {
      greeting: '你好{name}！',
    },
  }
  const runtime = new I18nRuntime(localeData)
  runtime.setLocale('en-US')
  const message = runtime.getString('greeting', { name: 'world' })
  expect(message).toEqual('Hello world!')

  runtime.setLocale('zh-CN')
  const message2 = runtime.getString('greeting', { name: '世界' })
  expect(message2).toEqual('你好世界！')
})

test('I18nRuntime', () => {
  const localeData = {
    'en-US': {
      test: `{ n, selectordinal,\
                one {#st}\
                two {#nd}\
                few {#rd}\
                other {#th}\
              } place`,
    },
  }

  const runtime = new I18nRuntime(localeData)
  runtime.setLocale('en-US')
  const message = runtime.getString('test', { n: 20 })
  expect(message).toEqual('Hello world!')
})
