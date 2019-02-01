import { parseTranslation } from '../..'

test('TranslationParser: basic', () => {
  const ast = parseTranslation('hello')
  expect(ast).toEqual(['hello'])
})

test('TranslationParser: interpolation', () => {
  const ast = parseTranslation('hello {name}')
  expect(ast).toEqual(['hello ', ['name']])
})

test('TranslationParser: should parse select expr', () => {
  const ast = parseTranslation(`{taxableArea, select,
      yes { An additional {taxRate} tax will be collected.}
      other {No taxes apply.}
    }`)
  expect(ast).toEqual([['taxableArea', 'select', {'other': ['No taxes apply.'], 'yes': [' An additional ', ['taxRate'], ' tax will be collected.']}]])
})

// TODO:
// test('TranslationParser: nested select expr', () => {
//   const ast = parseTranslation(`{taxableArea, select,
//       yes { An additional {taxRate} tax will be collected.}
//       other {No taxes apply.}
//     }`)
//   expect(ast).toEqual([['taxableArea', 'select', {'other': ['No taxes apply.'], 'yes': [' An additional ', ['taxRate'], ' tax will be collected.']}]])
// })
