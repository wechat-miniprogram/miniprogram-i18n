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
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'dev'),
    }),
  ]
}
