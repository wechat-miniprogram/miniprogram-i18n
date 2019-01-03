import { Transformer } from './transformer'

export const enum TranslationFunction {
  default = 't',
}

export const enum I18nTranslationFunctionName {
  default = '$_i18n.t',
}

/**
 * Transform miniprogram templates (WXML) to import i18n data and transform i18n invocations
 * i18n data will be imported via WXS mechanism while i18n invocations will be transformed
 * to normal WXS calls, e.g. t(key, val) will be transformed to something like $i18n.t(key, val)
 */
export default class TranslationFunctionTransformer implements Transformer {
  constructor(
    private translationFunctionName: string = TranslationFunction.default,
    private i18nFunctionName: string = I18nTranslationFunctionName.default,
  ) { }

  public transform(functionName: string): string {
    return functionName === this.translationFunctionName ? this.i18nFunctionName : functionName
  }
}
