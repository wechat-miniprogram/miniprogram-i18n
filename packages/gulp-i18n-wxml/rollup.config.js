import typescript from 'rollup-plugin-typescript'

module.exports = {
  input: 'index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
  ]
}
