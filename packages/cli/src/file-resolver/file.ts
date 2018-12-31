import { Nullable, RawEntry, LocaleName } from '../types'

interface FileEntry<K extends string, V> extends Map<K, V> {}

interface RawLocaleEntries extends FileEntry<LocaleName, RawEntry> {}

export class HierarchicalLocaleFile {
  constructor(
    public content: Nullable<RawLocaleEntries> = null,
    public childFiles: Array<HierarchicalLocaleFile> = [],
  ) { }
}

export class WxmlFile {
  constructor(
    public path: string,
    public content: string,
  ) { }
}
