import WxmlParser from '../../src/parser/wxml-parser'

test('wxml parser', () => {
  const p = new WxmlParser(`<view>abc</view>`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser nested case', () => {
  const p = new WxmlParser(`<view>abc<view class="test"></view></view><view>hello?</view>`)
  const node = p.parse()
  console.log('node:', node)
})

test('wxml parser: should ignore comments', () => {
  const p = new WxmlParser(`<view><!-- abcd -->real content</view>`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser: self closing tag', () => {
  const p = new WxmlParser(`<input class="test" />`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser: nested self closing tag', () => {
  const p = new WxmlParser(`<view><input/></view>`)
  const node = p.parse()
  console.log('node:', node[0])
})

test('wxml parser: attribute without value', () => {
  const p = new WxmlParser(`<input disabled />`)
  const node = p.parse()
  console.log('node:', node[0].dump())
})

const testCases = [
  {
    name: 'plain text',
    input: 'This is the plain text',
    expected: [{ type: 'text', content: 'This is the plain text' }],
  },
  {
    name: 'simple tag',
    input: '<view></view>',
    expected: [{ type: 'view', attributes: {}, children: [] }],
  },
  {
    name: 'simple comment',
    input: '<!-- comment -->',
    expected: [],
  },
  {
    name: 'text before tag',
    input: 'before<view>hello</view>',
    expected: [{ type: 'text', content: 'before' }, { type: 'view', attributes: {}, children: [{ type: 'text', content: 'hello' }]}],
  },
  {
    name: 'text after tag',
    input: '<view>hello</view>after',
    expected: [{ type: 'view', attributes: {}, children: [{ type: 'text', content: 'hello' }]}, { type: 'text', content: 'after' }],
  },
  {
    name: 'text inside tag',
    input: '<view>hello</view>',
    expected: [{ type: 'view', attributes: {}, children: [{ type: 'text', content: 'hello' }]}],
  },
  {
    name: 'attribute with single quote',
    input: '<view class=\'test\'></view>',
    expected: [{ type: 'view', attributes: { class: 'test' }, children: []}],
  },
  {
    name: 'attribute with double quote',
    input: '<view class="test"></view>',
    expected: [{ type: 'view', attributes: { class: 'test' }, children: []}],
  },
  {
    name: 'attribute without value',
    input: '<view diabled></view>',
    expected: [{ type: 'view', attributes: { diabled: null }, children: []}],
  },
  {
    name: 'tag with multiple attributes',
    input: '<view class="test" style="display: block;"></view>',
    expected: [{ type: 'view', attributes: { class: 'test', style: 'display: block;'}, children: []}],
  },
  {
    name: 'tag with multiple attributes and text child node',
    input: '<view class="test" style="display: block;">{{ t(\'key\') }}</view>',
    expected: [{ type: 'view', attributes: { class: 'test', style: 'display: block;'}, children: [{ type: 'text', content: '{{ t(\'key\') }}' }]}],
  },
  {
    name: 'tag with mixed attributes',
    input: '<view class=\'test\' style="display: block;"></view>',
    expected: [{ type: 'view', attributes: { class: 'test', style: 'display: block;'}, children: [] }],
  },
  {
    name: 'self closing tag',
    input: '<input value="{{ value }}" bindfocus="onFocused" />',
    expected: [{ type: 'input', attributes: { value: '{{ value }}', bindfocus: 'onFocused' }, children: [] }],
  },
  {
    name: 'nested self closing tag',
    input: '<view>name: <input value="{{ value }}" /></view>',
    expected: [{ type: 'view', attributes: { }, children: [{ type: 'text', content: 'name: ' }, { type: 'input', attributes: { value: '{{ value }}' }, children: [] }] }],
  },
  {
    name: 'self closing tag with space',
    input: '<input />',
    expected: [{ type: 'input', attributes: {}, children: [] }],
  },
  {
    name: 'self closing tag without space',
    input: '<input/>',
    expected: [{ type: 'input', attributes: {}, children: [] }],
  },
  {
    name: 'self closing tag with more space',
    input: '<input   />',
    expected: [{ type: 'input', attributes: {}, children: [] }],
  },
  {
    name: 'attributes with spaces',
    input: '<view class  =  "test" style = "abc"></view>',
    expected: [{ type: 'view', attributes: { class: 'test', style: 'abc' }, children: [] }],
  },
  {
    name: 'spaces in tag',
    input: '< view ></ view >',
    expected: [{ type: 'view', attributes: { }, children: [] }],
  },
  {
    name: 'self closing tag with attributes',
    input: '<input class="test" />',
    expected: [{ type: 'input', attributes: { class: 'test' }, children: [] }],
  },
  {
    name: 'nested tags',
    input: '<view><view class="a"><view class="b">{{ t("hello") }}</view></view></view>',
    expected: [{ type: 'view', attributes: { }, children: [
      { type: 'view', attributes: { class: 'a' }, children: [
        { type: 'view', attributes: { class: 'b' }, children: [{ type: 'text', content: '{{ t("hello") }}' }]},
      ]},
    ] }],
  },
  {
    name: 'nested tags with text and child tags',
    input: '<view>{{ t("key") }}<view class="test">hello</view></view>',
    expected: [{ type: 'view', attributes: {}, children: [{ type: 'text', content: '{{ t("key") }}' }, { type: 'view', attributes: {class: 'test'}, children: [{ type: 'text', content: 'hello'}] }] }],
  },
  {
    name: 'comments inside tag',
    input: '<view><!-- hello -->test<!--world-->abcd</view>',
    expected: [{ type: 'view', attributes: {}, children: [{ type: 'text', content: 'test' }, { type: 'text', content: 'abcd' }] }],
  },
  {
    name: 'wxml inside comments',
    input: '<view>hello<!-- </view> --></view>',
    expected: [{ type: 'view', attributes: {}, children: [{ type: 'text', content: 'hello' }] }],
  },
  {
    name: 'wxml inside attribute',
    input: '<view class="</view>"></view>',
    expected: [{ type: 'view', attributes: { class: '</view>' }, children: [] }],
  },
  {
    name: 'tag name with -',
    input: '<custom-component></custom-component>',
    expected: [{ type: 'custom-component', attributes: { }, children: [] }],
  },
  {
    name: 'tag name with _',
    input: '<custom_component></custom_component>',
    expected: [{ type: 'custom_component', attributes: { }, children: [] }],
  },
  {
    name: 'unicode characters inside tag',
    input: '<view>你好</view>',
    expected: [{ type: 'view', attributes: { }, children: [{ type: 'text', content: '你好' }] }],
  },
  {
    name: 'unicode characters inside attributes',
    input: '<view class="中文"></view>',
    expected: [{ type: 'view', attributes: { class: '中文' }, children: [] }],
  },
  {
    name: 'should work with html entities',
    input: '<view class="a&gt;b">&gt;&notin;&#X41;</view>',
    expected: [{ type: 'view', attributes: { class: 'a&gt;b' }, children: [
      { type: 'text', content: '&gt;&notin;&#X41;' },
    ] }],
  },
  {
    name: 'uppercase tag',
    input: '<VIEW>test</VIEW>',
    expected: [{ type: 'VIEW', attributes: {}, children: [{ type: 'text', content: 'test' }] }],
  },
  {
    name: 'mixed case tag',
    input: '<View>test</View>',
    expected: [{ type: 'View', attributes: {}, children: [{ type: 'text', content: 'test' }] }],
  },
  {
    name: 'uppercase attribute key',
    input: '<view CLASS="test"></view>',
    expected: [{ type: 'view', attributes: { CLASS: 'test' }, children: [] }],
  },
  {
    name: 'uppercase attribute value',
    input: '<view class="TEST"></view>',
    expected: [{ type: 'view', attributes: { class: 'TEST' }, children: [] }],
  },
  {
    name: 'multiple line tag',
    input: '<view \n class="test" \n>\nabc\ndef</view>',
    expected: [{ type: 'view', attributes: { class: 'test' }, children: [{ type: 'text', content: 'abc\ndef' }] }],
  },
  {
    name: 'multiple line comments',
    input: '<view><!--\n\n comments \n\n-->abc</view>',
    expected: [{ type: 'view', attributes: { }, children: [{ type: 'text', content: 'abc' }] }],
  },
  {
    name: 'wxs tag should be ignored',
    input: '<wxs> var a = 1; var b = 2; </wxs>',
    expected: [],
  },
  // {
  //   name: 'unfinished tag',
  //   input: '<view></view>',
  //   expected: [{ type: 'view', attributes: { class: '</view>' }, children: [] }],
  // },
]

// TODO: Test Chinese / unicode

testCases.forEach((testCase) => {
  test(`WXML parser: ${testCase.name}`, () => {
    const p = new WxmlParser(testCase.input)
    const nodes = p.parse()
    const dumpedNodes = nodes.map(node => node.dump())
    expect(dumpedNodes).toEqual(testCase.expected)
  })
})
