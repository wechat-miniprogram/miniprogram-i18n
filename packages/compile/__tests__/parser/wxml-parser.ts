import WxmlParser from '../../parser/wxml-parser'

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
    name: 'tag name with number',
    input: '<view2></view2>',
    expected: [{ type: 'view2', attributes: {}, children: [] }],
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
    name: 'attribute key with number',
    input: '<view class2="TEST"></view>',
    expected: [{ type: 'view', attributes: { class2: 'TEST' }, children: [] }],
  },
  {
    name: 'attribute key with colon',
    input: '<view wx:if="{{true}}"></view>',
    expected: [{ type: 'view', attributes: { 'wx:if': '{{true}}' }, children: [] }],
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
    input: '<view></view>test</view>',
    expected: [{type: 'view', attributes: {}, children: []}, { type: 'text', content: 'test' }],
  },
  {
    name: 'wxs tag should be ignored',
    input: "<wxs>var a = 1; var b = '</wxs>'</wxs>",
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var a = 1; var b = \'</wxs>\'' }] }],
  },
  {
    name: 'wxs tag should be ignored 2',
    input: '<wxs>var s = "</wxs>"</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var s = "</wxs>"' }] }],
  },
  {
    name: 'wxs tag should be ignored 3',
    input: '<wxs>var s = `<wxs></wxs>`</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var s = `<wxs></wxs>`' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are <',
    input: '<wxs>var r = 1 < 5;</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 < 5;' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are <<',
    input: '<wxs>var r = 1 << 5;</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 << 5;' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are <=',
    input: '<wxs>var r = 1 <= 5;</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 <= 5;' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are >',
    input: '<wxs>var r = 1 > 5;</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 > 5;' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are >',
    input: '<wxs>var r = 1 >> 5;</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 >> 5;' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are >=',
    input: '<wxs>var r = 1 >= 5;</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 >= 5;' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are < in comments',
    input: '<wxs>//</wxs></wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: '//</wxs>' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are < in multi-line comments',
    input: '<wxs>/*</wxs>*//* </wxs> */</wxs>',
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: '/*</wxs>*//* </wxs> */' }] }],
  },
  {
    name: 'wxs tag should be ignored even if there are < in comments 2',
    input: `
<wxs>
  // </wxs>
</wxs>`,
    expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: '// </wxs>\n' }] }],
  },
  // {
  //   name: 'wxs tag should be ignored even if there are < in block comments',
  //   input: '<wxs> /*</wxs>*/ </wxs>',
  //   expected: [{ type: 'wxs', attributes: {}, children: [{ type: 'text', content: 'var r = 1 >= 5;' }] }],
  // },
  {
    name: 'unfinished tag',
    input: '<view',
    expectThrows: true,
  },
  {
    name: 'unfinished tag 2',
    input: '<view ',
    expectThrows: true,
  },
  {
    name: 'unfinished tag 3',
    input: '<view $',
    expectThrows: true,
  },
  {
    name: 'unfinished tag 4',
    input: '<<',
    expectThrows: true,
  },
  {
    name: 'unfinished tag 5',
    input: '<test<',
    expectThrows: true,
  },
  {
    name: 'unfinished tag with normal tag afterwards',
    input: '<view<view></view>',
    expectThrows: true,
  },
  {
    name: 'unfinished attributes',
    input: '<view class="></view>',
    expectThrows: true,
  },
  {
    name: 'unfinished attributes',
    input: '<view class=></view>',
    expectThrows: true,
  },
  {
    name: 'invalid end tag',
    input: '<view></view 123>',
    expectThrows: true,
  },
]

testCases.forEach((testCase) => {
  test(`WXML parser: ${testCase.name}`, () => {
    const p = new WxmlParser(testCase.input)
    if (testCase.expectThrows) {
      expect(() => {
        const nodes = p.parse()
      }).toThrow()
      return
    }
    const nodes = p.parse()
    const dumpedNodes = nodes.map(node => node.dump())
    expect(dumpedNodes).toEqual(testCase.expected)
  })
})
