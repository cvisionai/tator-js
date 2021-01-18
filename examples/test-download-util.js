const yargs = require('yargs');

const Tator = require('..');

const argv = yargs
  .option('host', {
    alias: 's',
    description: 'Tator host URL',
    type: 'string',
    default: 'https://www.tatorapp.com'
  })
  .option('token', {
    alias: 't',
    description: 'Your API token',
    type: 'string',
    demandOption: true
  })
  .option('project-id', {
    alias: 'p',
    description: "Project ID",
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;

var tatorApi = Tator.Utils.getApi(argv.host, argv.token);

tatorApi.getMediaStats(argv['project-id']).then(console.log, console.log);

tatorApi.getMediaList(argv['project-id']).then(console.log, console.log);

tatorApi.getMedia(651).then(console.log, console.log);