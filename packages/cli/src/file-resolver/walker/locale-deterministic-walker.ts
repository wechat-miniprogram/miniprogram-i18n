import path from 'path'
import { HierarchicalLocaleFile } from '../file'
import { readJSONFile } from '../../utils/fs'
import { LocaleNames } from '../../types'
import { LocaleFileWalker } from './file-walker'

/**
 * LocaleDeterministicWalker will fetch locale files from specified folder
 */
export default class LocaleDeterministicWalker implements LocaleFileWalker {
  async walk(folders: string[], ext: string, locales: LocaleNames): Promise<HierarchicalLocaleFile> {
    // TODO: consider using concurrent read with threshold
    const rootLococaleFile = new HierarchicalLocaleFile()
    for (const folder of folders) {
      const localesMap = new Map()
      for (const locale of locales) {
        const content = await readJSONFile(path.join(folder, locale + ext))
        localesMap.set(locale, content)
      }
      rootLococaleFile.content = localesMap
    }
    return rootLococaleFile
  }
}
