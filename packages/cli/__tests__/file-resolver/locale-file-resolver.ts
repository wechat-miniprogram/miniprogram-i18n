import path from 'path'
import LocaleFileResolver from '../../src/file-resolver/locale-file-resolver'
import DeterministicWalker from '../../src/file-resolver/deterministic-walker'
import RecursiveWalker from '../../src/file-resolver/recursive-walker'

test('LocaleFileResolver with DeterministicWalker', async () => {
  const resolver = new LocaleFileResolver(new DeterministicWalker())
  const locales = await resolver.resolve(
    [path.join(path.dirname(__filename), '../fixtures/deterministic-walker/i18n')],
    ['en-US', 'zh-CN'],
  )
  expect(locales['en-US']).toEqual({ testkey: 'testval' })
  expect(locales['zh-CN']).toEqual({ testkey: '测试'})
})

test('LocaleFileResolver with RecursiveWalker', async () => {
  const resolver = new LocaleFileResolver(new RecursiveWalker())
  const locales = await resolver.resolve(
    [path.join(path.dirname(__filename), '../fixtures/recursive-walker')],
    ['en-US', 'zh-CN'],
  )
  expect(locales['en-US']).toEqual({ component: 'testval', root: 'testval', page: 'testval' })
  expect(locales['zh-CN']).toEqual({ component: '测试', root: '测试', page: '测试' })
})

test('LocaleFileResolver with duplicated keys', async () => {

})
