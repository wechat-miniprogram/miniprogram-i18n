import { interpret } from '../../interpreter'

test('Interpreter: plain text message', () => {
  const formatted = interpret(['plain text message'])
  expect(formatted).toEqual('plain text message')
})

test('Interpreter: empty message', () => {
  const formatted = interpret([''])
  expect(formatted).toEqual('')
})

test('Interpreter: simple interpolotion', () => {
  const formatted = interpret(['hello ', ['what'], '!'], { what: 'world' })
  expect(formatted).toEqual('hello world!')
})

test('Interpreter: multiple interpolotion', () => {
  const formatted = interpret(['start ', ['param1'], ' ', ['param2'], ' end'], { param1: 'p1', param2: 'p2' })
  expect(formatted).toEqual('start p1 p2 end')
})

test('Interpreter: interpolotion without params', () => {
  const formatted = interpret(['start ', ['param1'], ' end'])
  expect(formatted).toEqual('start {param1} end')
})

test('Interpreter: interpolotion with deeply object', () => {
  const formatted = interpret(['start ', ['a.b.c'], ' end'], { a: { b: { c: 'test'}}})
  expect(formatted).toEqual('start test end')
})

test('Interpreter: interpolotion with deeply object but empty object', () => {
  const formatted = interpret(['start ', ['a.b.c'], ' end'], { a: {}})
  expect(formatted).toEqual('start {a.b.c} end')
})

test('Interpreter: select statements', () => {
  const formatted = interpret(
    [['taxableArea', 'select', {'other': ['No taxes apply.'], 'yes': ['An additional ', ['taxRate'], ' tax will be collected.']}]],
    { taxableArea: 'yes', taxRate: 20 },
  )
  expect(formatted).toEqual('An additional 20 tax will be collected.')
})

test('Interpreter: select statements should support other fallback', () => {
  const formatted = interpret(
    [['taxableArea', 'select', {'other': ['No taxes apply.'], 'yes': ['An additional ', ['taxRate'], ' tax will be collected.']}]],
    { taxableArea: 'no', taxRate: 20 },
  )
  expect(formatted).toEqual('No taxes apply.')
})

test('Interpreter: select statements should return child expr when params not provided', () => {
  const formatted = interpret(
    [['taxableArea', 'select', {'other': ['No taxes apply.'], 'yes': ['An additional ', ['taxRate'], ' tax will be collected.']}]],
    { taxableArea: 'yes' },
  )
  expect(formatted).toEqual('An additional {taxRate} tax will be collected.')
})

test('Interpreter: select statements should return support boolean values', () => {
  const formatted = interpret(
    [['taxableArea', 'select', {'other': ['No taxes apply.'], true: ['An additional ', ['taxRate'], ' tax will be collected.']}]],
    { taxableArea: true, taxRate: 20 },
  )
  expect(formatted).toEqual('An additional 20 tax will be collected.')
})

test('Interpreter: select statements should return support boolean values 2', () => {
  const formatted = interpret(
    [['taxableArea', 'select', {'other': ['No taxes apply.'], 'true': ['An additional ', ['taxRate'], ' tax will be collected.']}]],
    { taxableArea: true, taxRate: 20 },
  )
  expect(formatted).toEqual('An additional 20 tax will be collected.')
})

test('interpreter: select statements nested select statements', () => {
  const formatted = interpret(
    [['cond1', 'select', {'other': ['Cond 1 other'], 'yes': [['cond2', 'select', {'other': ['Cond 2 other'], 'yes': ['Cond 2 match', ', ', ['val']]}]]}]],
    { cond1: 'yes', cond2: 'yes', val: 'extra value' },
  )
  expect(formatted).toEqual('Cond 2 match, extra value')
})

test('interpreter: select statements with normal strings', () => {
  const formatted = interpret(
    ['Start ', ['cond1', 'select', {'other': ['Cond 1 other'], 'yes': ['middle ', ['cond2', 'select', {'other': ['Cond 2 other'], 'yes': ['Cond 2 match', ', ', ['val']]}]]}], ' end'],
    { cond1: 'yes', cond2: 'yes', val: 'extra value' },
  )
  expect(formatted).toEqual('Start middle Cond 2 match, extra value end')
})
