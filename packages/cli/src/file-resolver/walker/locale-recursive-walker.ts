import path from 'path'
import { HierarchicalLocaleFile } from '../file'
import { readJSONFile, existsAsync, readdirAsync, lstatAsync } from '../../utils/fs'
import { LocaleNames } from '../../types'
import { LocaleFileWalker } from './file-walker'

/**
 * RecursiveWalker will walk through entire projects to get locale files
 */
export default class LocaleRecursiveWalker implements LocaleFileWalker {
  async walk(folders: string[], ext: string, locales: LocaleNames): Promise<HierarchicalLocaleFile> {
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
      currentFile.content = localesMap
    }
    // See if there is any child folders
    const files = await readdirAsync(folder)
    for (const file of files) {
      const curPath = path.join(folder, file)
      const stat = await lstatAsync(curPath)
      if (stat.isDirectory()) {
        const childFile = await this._walk(curPath, locales, ext)
        if (!childFile.content) {
          currentFile.childFiles.push(...childFile.childFiles)
        } else {
          currentFile.childFiles.push(childFile)
        }
      }
    }
    return currentFile
  }
}
