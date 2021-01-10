const Tator = require('../pkg');

function getApi(host='https://www.tatorapp.com', token=process.env.TATOR_TOKEN) {
  var defaultClient = Tator.ApiClient.instance;
  var TokenAuth = defaultClient.authentications['TokenAuth'];
  TokenAuth.apiKey = token;
  defaultClient.host = host;
  return new Tator.TatorApi()
}