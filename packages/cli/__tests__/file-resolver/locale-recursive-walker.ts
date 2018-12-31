import path from 'path'
import RecursiveWalker from '../../src/file-resolver/walker/locale-recursive-walker'
import { HierarchicalLocaleFile } from '../../src/file-resolver/file'
import { RawEntry } from '../../src/types'

function traverseFiles(file: HierarchicalLocaleFile, retval: Array<Map<string, RawEntry>>) {
  if (file.content) {
    retval.push(file.content)
  }
  for (const child of file.childFiles) {
    traverseFiles(child, retval)
  }
}

test('RecursiveWalker', async () => {
  const walker = new RecursiveWalker()
  const file = await walker.walk(
    [path.join(path.dirname(__filename), '../fixtures/recursive-walker')],
    '.json',
    ['en-US', 'zh-CN'],
  )
  const retval: Array<Map<string, RawEntry>> = []
  traverseFiles(file, retval)
  expect(retval).toHaveLength(3)
})
