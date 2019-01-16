import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';

module.exports = {
  input: 'index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    replace({
      DEV: 'true',
    }),
  ]
}
