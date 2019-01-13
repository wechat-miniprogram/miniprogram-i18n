import typescript from 'rollup-plugin-typescript';

module.exports = {
  input: 'wxs/index.ts',
  output: {
    file: 'dist/wxs.js',
    format: 'iife',
    name: 'Interpreter',
    strict: false,
  },
  plugins: [
    typescript(),
  ]
}
