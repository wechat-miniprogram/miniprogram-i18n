import path from 'path'
import { WxmlFileWalker } from './file-walker'
import { WxmlFile } from '../file'
import { readdirAsync, lstatAsync, readFileAsync } from '../../utils/fs'

export class WxmlRecursiveFileWalker implements WxmlFileWalker {
  async walk(dir: string, ext: string): Promise<WxmlFile[]> {
    const files = await readdirAsync(dir)
    const fileDic = []
    for (const file of files) {
      const stat = await lstatAsync(path.join(dir, file))
      if (stat.isFile() && file.endsWith(ext)) {
        const uri = path.join(dir, file)
        const content = await readFileAsync(uri, 'utf-8')
        fileDic.push(new WxmlFile(uri, content))
      } else if (stat.isDirectory()) {
        const childFiles = await this.walk(path.join(dir, file), ext)
        fileDic.push(...childFiles)
      }
    }
    return fileDic
  }
}
