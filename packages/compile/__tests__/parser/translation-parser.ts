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

test('TranslationParser: should parse select expr', () => {
  const ast = parseTranslation(`{mood, select, good {{how} day!} sad {{how} day.} other {Whatever!}}`)
  expect(ast).toEqual([['mood', 'select', {'good': [['how'], ' day!'], 'other': ['Whatever!'], 'sad': [['how'], ' day.']}]])
})

test('TranslationParser: nested select expr', () => {
  const ast = parseTranslation(`{taxableArea, select,
			yes {{test, select, yes {hi} other {no}}}
			other {No taxes apply.}
		}`)
  expect(ast).toEqual([['taxableArea', 'select', {'other': ['No taxes apply.'], 'yes': [['test', 'select', {'other': ['no'], 'yes': ['hi']}]]}]])
})
