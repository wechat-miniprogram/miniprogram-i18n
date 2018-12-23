import path from 'path'
import DeterministicWalker from '../../src/file-resolver/deterministic-walker'

test('DeterministicWalker', async () => {
  const walker = new DeterministicWalker()
  const files = await walker.walk([path.join(path.dirname(__filename), '../fixtures/deterministic-walker/i18n')], ['en-US', 'zh-CN'], '.json')
  expect(files.locales).not.toBeNull()
  expect(files.locales!.size).toBe(2)
})
