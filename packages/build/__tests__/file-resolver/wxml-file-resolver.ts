import path from 'path'
import { WxmlFileResolver } from '../../src/file-resolver/wxml-file-resolver'

test('Wxml file resolver', async () => {
  const uri = path.join(path.dirname(__filename), '../fixtures/wxml-walker')
  const resolver = new WxmlFileResolver()
  await resolver.resolve(uri)
})
