import { FileResolver } from './file-resolver'
import { WxmlRecursiveFileWalker } from './walker/wxml-recursive-walker'

export enum WxmlFileFormat {
  WXML = '.wxml',
}

export class WxmlFileResolver implements FileResolver {
  private walker = new WxmlRecursiveFileWalker()
  constructor(private ext: string  = WxmlFileFormat.WXML) { }

  async resolve(path: string) {
    return this.walker.walk(path, this.ext)
  }
}
