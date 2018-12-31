import { Transformer } from './transfomer'

const getTranslationFunctionRegex = (funcName: string) => {
  return new RegExp(funcName, 'mg')
}

enum TranslationFunction {
  default = 't',
}

/**
 * Transform miniprogram templates (WXML) to import i18n data and transform i18n invocations
 * i18n data will be imported via WXS mechanism while i18n invocations will be transformed
 * to normal WXS calls, e.g. t(key, val) will be transformed to something like $i18n.t(key, val)
 */
export default class TemplateTransformer implements Transformer {
  constructor(public translationFunctionName: string = TranslationFunction.default) {

  }

  public transform(template: string): string {
    // Assume translation function name is t
    // t(key, params) will be transformed to _$i18n.t(key, params)
    // <view title="{{ t('title') }}">{{ t('content') }}</view>
    // <view title="{{ _$i18n.t('title', { val: t('title3') }) }}">{{ _$i18n.t('content') }}</view>
    // <view title="{{ _$i18n.t('title', { val: _$i18n.t('title3) }) + _$i18n.t('title2') }}">{{ _$i18n.t('content') }}</view>
    return template
  }
}
