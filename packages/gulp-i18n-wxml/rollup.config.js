import fs from 'fs'
import typescript from 'rollup-plugin-typescript';

module.exports = {
  input: 'index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    typescript()
  ]
}
