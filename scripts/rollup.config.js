import typescript from 'rollup-plugin-typescript';

module.exports = {
  input: 'packages/i18n/src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript()
  ]
}
