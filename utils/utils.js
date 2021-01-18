import ApiClient from '../ApiClient';
import TatorApi from '../api/TatorApi';

class Utils {
  static getApi(host='https://www.tatorapp.com', token=process.env.TATOR_TOKEN) {
    var defaultClient = ApiClient.instance;
    var TokenAuth = defaultClient.authentications['TokenAuth'];
    TokenAuth.apiKey = token;
    TokenAuth.apiKeyPrefix = "Token";
    defaultClient.basePath = host;
    return new TatorApi(defaultClient);
  }
}

export default Utils;