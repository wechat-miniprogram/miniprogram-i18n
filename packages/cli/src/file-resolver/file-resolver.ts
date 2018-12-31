export interface FileResolver {
  resolve(path: string | string[], additionals?: object): object
}
