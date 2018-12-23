import path from 'path'
import { LocaleNames, Nullable, RawLocaleEntries, LocaleContainer } from '../types'
import { I18nError } from '../utils/error'

type NullableLocaleEntries = Nullable<RawLocaleEntries>
type HierarchicalLocaleFileList = Array<HierarchicalLocaleFile>

export class HierarchicalLocaleFile {
  constructor(
    public locales: NullableLocaleEntries = null,
    public childLocales: HierarchicalLocaleFileList = [],
  ) {}
}

export interface FileWalker {
  walk(folders: string[], locales: LocaleNames, ext: string): Promise<HierarchicalLocaleFile>
}

export enum LocaleFileFormat {
  // Note: currently only json file is supported
  JSON = '.json',
}

export default class LocaleFileResolver {
  private static defaultExtName = LocaleFileFormat.JSON

  constructor(private walker: FileWalker, private ext: LocaleFileFormat = LocaleFileResolver.defaultExtName) { }

  async resolve(paths: string[], locales: LocaleNames) {
    const normalizedPaths = this.normalizePath(paths)
    const localeContents = await this.walker.walk(normalizedPaths, locales, this.ext)
    return this.mergeLocales(localeContents, locales)
  }

  /**
   * Use DFS to merge all locales collected by file walkers
   * @param localeFile
   */
  private mergeLocales(localeFile: HierarchicalLocaleFile, localeNames: LocaleNames): LocaleContainer {
    const container: LocaleContainer = {}
    // Construct container by localeNames
    for (const localeName of localeNames) {
      container[localeName] = {}
    }

    // Traverse child folders first of all
    for (const childFile of localeFile.childLocales) {
      const childLocalesContainer = this.mergeLocales(childFile, localeNames)
      for (const localeName of Object.keys(childLocalesContainer)) {
        if (container[localeName]) {
          Object.assign(container[localeName], childLocalesContainer[localeName])
        }
      }
    }

    // Parent folder has higher priority over child folders
    // which means duplicated key in child folder won't even work
    const locales = localeFile.locales
    if (locales) {
      for (const [localeName, localeEntry] of locales) {
        if (container[localeName]) {
          Object.assign(container[localeName], localeEntry)
        }
      }
    }

    return container
  }

  private normalizePath(paths: string[]): string[] {
    if (!Array.isArray(paths)) throw I18nError('path should be an array')
    return paths.map(p => path.resolve(p))
  }
}
