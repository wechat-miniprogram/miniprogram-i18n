import { interpret } from '../../src/intepreter'

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
  expect(formatted).toEqual('start  end')
})

test('Interpreter: interpolotion with deeply object', () => {
  const formatted = interpret(['start ', ['a.b.c'], ' end'], { a: { b: { c: 'test'}}})
  expect(formatted).toEqual('start test end')
})

test('Interpreter: interpolotion with deeply object but empty object', () => {
  const formatted = interpret(['start ', ['a.b.c'], ' end'], { a: {}})
  expect(formatted).toEqual('start  end')
})
