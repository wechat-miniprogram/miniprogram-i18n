import path from 'path'
import DeterministicWalker from '../../src/file-resolver/walker/locale-deterministic-walker'

test('DeterministicWalker', async () => {
  const walker = new DeterministicWalker()
  const files = await walker.walk(
    [path.join(path.dirname(__filename), '../fixtures/deterministic-walker/i18n')],
    '.json',
    ['en-US', 'zh-CN'],
  )
  expect(files.content).not.toBeNull()
  expect(files.content!.size).toBe(2)
})
