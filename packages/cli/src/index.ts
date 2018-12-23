import { I18nError, formatErrors } from './utils/error'
import { LocaleNames } from './types'

interface Config {
  defaultLocale: string
  locales: LocaleNames
  fallbackLocale: string
  localeFolder: string
}

export function validateI18nConfig(config: Config): Array<Error> {
  const errors = []
  // Verify format of config file
  if (!config.defaultLocale) errors.push(I18nError('defaultLocale should be specify in app.json'))
  if (!config.locales || !Array.isArray(config.locales) || config.locales.length === 0) {
    errors.push(I18nError('locales should be a non-empty array'))
  }
  if (!config.fallbackLocale) errors.push(I18nError('fallbackLocale is not specified'))
  if (!config.localeFolder) errors.push(I18nError('localeFolder should be specified'))
  return errors
}

export function launchCLIApp(config: Config): void {
  const errors = validateI18nConfig(config)
  if (errors.length) {
    console.error(formatErrors(errors))
    return
  }
  // const locales = loadLocaleFiles(config.localeFolder, config.locales)
  // console.log(locales)
}
