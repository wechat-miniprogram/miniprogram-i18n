import { Transformer } from './transfomer'

/**
 * Transform miniprogram templates (WXML) to import i18n data and transform i18n invocations
 * i18n data will be imported via WXS mechanism while i18n invocations will be transformed
 * to normal WXS calls, e.g. t(key, val) will be transformed to something like $i18n.t(key, val)
 */
export default class TemplateTransformer implements Transformer {
  public transform(template: string): string {
    return template
  }
}
