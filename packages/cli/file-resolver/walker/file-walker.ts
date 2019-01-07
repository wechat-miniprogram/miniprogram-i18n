import { HierarchicalLocaleFile, WxmlFile } from '../file'

export interface LocaleFileWalker {
  walk(dir: string | string[], ext: string, options?: Array<string>): Promise<HierarchicalLocaleFile>
}

export interface WxmlFileWalker {
  walk(dir: string, ext: string): Promise<WxmlFile[]>
}
