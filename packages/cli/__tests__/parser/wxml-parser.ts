import WxmlParser, { Element } from '../../src/parser/wxml-parser'

test('wxml parser', () => {
  const p = new WxmlParser(`<view>abc</view>`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser 2', () => {
  const p = new WxmlParser(`<view>abc<view class="test"></view></view><view>hello?</view>`)
  const node = p.parse()
  console.log('node:', node)
})

test('wxml parser 2', () => {
  const p = new WxmlParser(`<script> var a = []; var b = '' </script>`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser: ignore comments', () => {
  const p = new WxmlParser(`<view><!-- abcd -->real content</view>`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser: self closing tag', () => {
  const p = new WxmlParser(`<input class="test" />`)
  const node = p.parse()
  console.log('node:', node[0])
})
