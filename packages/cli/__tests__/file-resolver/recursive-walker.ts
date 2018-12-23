import path from 'path'
import RecursiveWalker from '../../src/file-resolver/recursive-walker'
import { HierarchicalLocaleFile } from '../../src/file-resolver/locale-file-resolver'

function traverseFiles(file: HierarchicalLocaleFile, retval: Array<Map<string, string>>) {
  if (file.locales) {
    retval.push(file.locales)
  }
  for (const child of file.childLocales) {
    traverseFiles(child, retval)
  }
}

test('RecursiveWalker', async () => {
  const walker = new RecursiveWalker()
  const file = await walker.walk(
    [path.join(path.dirname(__filename), '../fixtures/recursive-walker')],
    ['en-US', 'zh-CN'],
    '.json',
  )
  const retval: Array<Map<string, string>> = []
  traverseFiles(file, retval)
  expect(retval).toHaveLength(3)
})
