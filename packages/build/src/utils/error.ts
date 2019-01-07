export function I18nError(message: string) {
  return new Error(`[i18n] error: ${message}`)
}

export function formatErrors(errors: Error[]) {
  const tpl = ['I18n errors found, please fix following issues before proceed:']
  for (let i = 0; i < errors.length; i++) {
    tpl.push(`${i + 1}. ${errors[i].message}`)
  }
  return tpl.join('\n')
}
