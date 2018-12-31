export interface RawEntry { [key: string]: string }

export type LocaleName = string
export type LocaleNames = Array<LocaleName>
// export type RawLocaleEntries = Map<LocaleName, RawEntry>
export interface LocaleContainer {
  [localeName: string]: RawEntry
}
export type Nullable<T> = T | null
