import { parseTranslation } from '../..'

test('TranslationParser: basic', () => {
  const ast = parseTranslation('hello')
  expect(ast).toEqual(['hello'])
})

test('TranslationParser: interpolation', () => {
  const ast = parseTranslation('hello {name}')
  expect(ast).toEqual(['hello ', ['name']])
})
