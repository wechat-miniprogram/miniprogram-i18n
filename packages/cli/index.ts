import fs from 'fs'
import * as path from 'path'
import gulp from 'gulp'

// import program from 'commander'

// program.version('1.0.0')
//   .option('-c, --config', 'Specify i18n.config.json file')
//   .parse(process.argv)

// if (!program.config) {
//   console.log('Please specify i18n.config.json file')
// }

const coreModulePath = path.dirname(require.resolve('@miniprogram-i18n/core/package.json'))

declare var DEV: boolean

const wxsCodePath = path.join(coreModulePath, DEV ? './dist/wxs.js' : 'wxs.js')
console.log(wxsCodePath)

const wxsCode = fs.readFileSync(wxsCodePath, 'utf-8')
console.log(wxsCode)
