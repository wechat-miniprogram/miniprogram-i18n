import path from 'path'
import { LocaleNames, Nullable, LocaleContainer } from '../types'
import { I18nError } from '../utils/error'
import { FileResolver } from './file-resolver'
import { LocaleFileWalker } from './walker/file-walker'
import { HierarchicalLocaleFile } from './file'

export enum LocaleFileFormat {
  // Note: currently only json file is supported
  JSON = '.json',
}

export default class LocaleFileResolver implements FileResolver {
  constructor(private walker: LocaleFileWalker, private ext: LocaleFileFormat = LocaleFileFormat.JSON) { }

  async resolve(paths: string[], locales: LocaleNames) {
    const normalizedPaths = this.normalizePath(paths)
    const localeContents = await this.walker.walk(normalizedPaths, this.ext, locales)
    return this.mergeLocales(localeContents, locales)
  }

  /**
   * Merge all locales collected by locale file walker
   * @param localeFile
   */
  private mergeLocales(localeFile: HierarchicalLocaleFile, localeNames: LocaleNames): LocaleContainer {
    const container: LocaleContainer = {}
    // Construct container by localeNames
    for (const localeName of localeNames) {
      container[localeName] = {}
    }

    // Traverse child folders first of all
    for (const childFile of localeFile.childFiles) {
      const childLocalesContainer = this.mergeLocales(childFile, localeNames)
      for (const localeName of Object.keys(childLocalesContainer)) {
        if (container[localeName]) {
          Object.assign(container[localeName], childLocalesContainer[localeName])
        }
      }
    }

    // Parent folder has higher priority over child folders
    // which means duplicated key in child folder will be ignored
    const locales = localeFile.content
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
