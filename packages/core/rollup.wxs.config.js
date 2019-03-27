import typescript from 'rollup-plugin-typescript';
import { uglify } from "rollup-plugin-uglify";

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
    uglify()
  ]
}
