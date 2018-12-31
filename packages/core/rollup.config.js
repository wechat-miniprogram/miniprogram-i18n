import typescript from 'rollup-plugin-typescript';

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript()
  ]
}
