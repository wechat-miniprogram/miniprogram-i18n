import program from 'commander'

// Setting up CLI options and pass options to launch CLI
program.version('1.0.0')
  .option('-c, --config', 'Specify app.json file')
  .parse(process.argv)

if (program.config) {

}
