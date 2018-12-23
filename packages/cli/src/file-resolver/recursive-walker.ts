import path from 'path'
import { FileWalker, HierarchicalLocaleFile } from './locale-file-resolver'
import { readJSONFile, existsAsync, readdirAsync, lstatASync } from '../utils/fs'
import { LocaleNames } from '../types'

/**
 * RecursiveWalker will walk through entire projects to get locale files
 */
export default class RecursiveWalker implements FileWalker {
  async walk(folders: string[], locales: string[], ext: string): Promise<HierarchicalLocaleFile> {
    return this._walk(folders[0], locales, ext)
  }

  async _walk(folder: string, locales: LocaleNames, ext: string): Promise<HierarchicalLocaleFile> {
    const currentFile = new HierarchicalLocaleFile()
    const hasLocaleFile = await existsAsync(path.join(folder, locales[0] + ext))
    if (hasLocaleFile) {
      const localesMap = new Map()
      for (const locale of locales) {
        // TODO: concurrent load?
        const localeContent = await readJSONFile(path.join(folder, locale + ext))
        localesMap.set(locale, localeContent)
      }
      currentFile.locales = localesMap
    }
    // See if there is any child folders
    const files = await readdirAsync(folder)
    for (const file of files) {
      const curPath = path.join(folder, file)
      const stat = await lstatASync(curPath)
      if (stat.isDirectory()) {
        const childFile = await this._walk(curPath, locales, ext)
        if (!childFile.locales) {
          currentFile.childLocales.push(...childFile.childLocales)
        } else {
          currentFile.childLocales.push(childFile)
        }
      }
    }
    return currentFile
  }
}
