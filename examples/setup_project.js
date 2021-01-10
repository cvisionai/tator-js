const yargs = require('../pkg/node_modules/yargs');

const Tator = require('../pkg');

function getApi(host='https://www.tatorapp.com', token=process.env.TATOR_TOKEN) {
  var defaultClient = Tator.ApiClient.instance;
  var TokenAuth = defaultClient.authentications['TokenAuth'];
  TokenAuth.apiKey = token;
  TokenAuth.apiKeyPrefix = "Token";
  defaultClient.basePath = host;
  return new Tator.TatorApi()
}

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
  .option('name', {
    alias: 'n',
    description: "New project's name",
    type: 'string',
    demandOption: true
  })
  .option('create-state-latest-type', {
    description: "Create a state type with latest interpolation/frame association attributes"
  })
  .option('create-state-range-type', {
    description: "Create state types with attr_style_range interpolation/frame association"
  })
  .option('create-track-type', {
    description: "Create a state type with localization association"
  })
  .help()
  .alias('help', 'h')
  .argv;


// console.log(argv);
var tatorApi = getApi(argv.host, argv.token);
// console.log(tatorApi.apiClient);
tatorApi.createOrganization({"name": "Dave Org 2"}).then(function(data) {
  console.log(data);
}, function(error) {
  console.log(error);
});
