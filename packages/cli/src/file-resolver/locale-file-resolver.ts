import path from 'path'
import { Locales, Nullable } from '../types'
import { I18nError } from '../utils/error'

export class HierarchicalLocaleFile {
  constructor(
    public locales: Nullable<Map<string, string>> = null,
    public childLocales: Array<HierarchicalLocaleFile> = [],
  ) {}
}

export interface FileWalker {
  walk(folders: string[], locales: Locales, ext: string): Promise<HierarchicalLocaleFile>
}

export enum LocaleFileFormat {
  // Note: currently only json file is supported
  JSON = '.json',
}

export default class LocaleFileResolver {
  private static defaultExtName = LocaleFileFormat.JSON

  constructor(private walker: FileWalker, private ext: LocaleFileFormat = LocaleFileResolver.defaultExtName) { }

  async resolve(paths: string[], locales: Locales) {
    const normalizedPaths = this.normalizePath(paths)
    const localeContents = await this.walker.walk(normalizedPaths, locales, this.ext)
    return this.mergeLocales(localeContents)
  }

  private mergeLocales(localeFile: HierarchicalLocaleFile) {

  }

  private normalizePath(paths: string[]): string[] {
    if (!Array.isArray(paths)) throw I18nError('path should be an array')
    return paths.map(p => path.resolve(p))
  }
}
