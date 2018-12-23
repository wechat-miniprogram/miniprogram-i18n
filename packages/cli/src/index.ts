import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { I18nError, formatErrors } from './utils/error'

const readFileAsync = promisify(fs.readFile)

type Locale = string
type Locales = Array<Locale>

interface Config {
  defaultLocale: string
  locales: Locales
  fallbackLocale: string
  localeFolder: string
}

export function validateI18nConfig(config: Config): boolean {
  const errors = []
  // Verify format of config file
  if (!config.defaultLocale) errors.push(I18nError('defaultLocale should be specify in app.json'))
  if (!config.locales || !Array.isArray(config.locales) || config.locales.length === 0) {
    errors.push(I18nError('locales should be a non-empty array'))
  }
  if (!config.fallbackLocale) errors.push(I18nError('fallbackLocale is not specified'))
  if (!config.localeFolder) errors.push(I18nError('localeFolder should be specified'))
  if (!!errors.length) {
    console.error(formatErrors(errors))
    return false
  }
  return true
}

/**
 * Load locale files from specified folder path,
 * only `locales` specified in app.json will be loaded
 *
 * @param folder
 * @param locales
 */
export async function loadLocaleFiles(folder: string, locales: Locales): Promise<Map<Locale, string>> {
  const localeFiles = new Map()
  for (const locale of locales) {
    const localePath = path.join(folder, `${locale}.json`)
    const localeFile = await readFileAsync(localePath, { encoding: 'utf-8' })
    let localeContent = null
    try {
      localeContent = JSON.parse(localeFile)
      localeFiles.set(locale, localeContent)
    } catch (err) {
      throw I18nError(`invalid locale file ${localePath}, ensure locale file is in valid JSON format`)
    }
  }
  return localeFiles
}

export function launchCLIApp(config: Config): void {
  if (!validateI18nConfig(config)) process.exit(1)
  const locales = loadLocaleFiles(config.localeFolder, config.locales)
  console.log(locales)
}
