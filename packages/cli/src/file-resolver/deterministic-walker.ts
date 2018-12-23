import path from 'path'
import { FileWalker, HierarchicalLocaleFile } from './locale-file-resolver'
import { readJSONFile } from '../utils/fs'
import { LocaleNames } from '../types'

/**
 * DeterministicWalker will fetch locale files from specified folder
 */
export default class DeterministicWalker implements FileWalker {
  async walk(folders: string[], locales: LocaleNames, ext: string): Promise<HierarchicalLocaleFile> {
    // TODO: consider using concurrent read with threshold
    const rootLococaleFile = new HierarchicalLocaleFile()
    for (const folder of folders) {
      const localesMap = new Map()
      for (const locale of locales) {
        const content = await readJSONFile(path.join(folder, locale + ext))
        localesMap.set(locale, content)
      }
      rootLococaleFile.locales = localesMap
    }
    return rootLococaleFile
  }
}
