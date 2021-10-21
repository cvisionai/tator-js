import ApiClient from '../ApiClient';
import TatorApi from '../api/TatorApi';

class Utils {
  static getApi(host=null, token=null) {
    var defaultClient = ApiClient.instance;
    if (host === null) {
      host = window.location.origin;
    }
    if (token) {
      var TokenAuth = defaultClient.authentications['TokenAuth'];
      TokenAuth.apiKey = token;
      TokenAuth.apiKeyPrefix = "Token";
    } else {
      let CookieAuth = defaultClient.authentications['CookieAuth'];
      let value = "; " + document.cookie;
      let parts = value.split("; csrftoken=");
      if (parts.length == 2) {
        value = parts.pop().split(";").shift();
      }
      CookieAuth.apiKey = value;
    }
    defaultClient.basePath = host;
    return new TatorApi(defaultClient);
  }
}

export default Utils;
