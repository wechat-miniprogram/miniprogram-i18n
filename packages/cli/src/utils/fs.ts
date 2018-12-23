import fs from 'fs'
import { promisify } from 'util'
import { I18nError } from './error'

export const readFileAsync = promisify(fs.readFile)
export const existsAsync = promisify(fs.exists)
export const readdirAsync = promisify(fs.readdir)
export const lstatASync = promisify(fs.lstat)

/**
 * Load JSON files from specified path
 *
 * @param path
 */
export async function readJSONFile(path: string): Promise<object> {
  const file = await readFileAsync(path, { encoding: 'utf-8' })
  let parsedContent = null
  try {
    parsedContent = JSON.parse(file)
  } catch (err) {
    throw I18nError(`invalid locale file ${path}, ensure locale file is in valid JSON format`)
  }
  return parsedContent
}
