import ApiClient from '../ApiClient';
import TatorApi from '../api/TatorApi';

function getApi(host=null, token=null) {
  var defaultClient = ApiClient.instance;
  if (host === null && typeof window !== 'undefined') {
    host = window.location.origin;
  }
  if (token) {
    var TokenAuth = defaultClient.authentications['TokenAuth'];
    TokenAuth.apiKey = token;
    TokenAuth.apiKeyPrefix = "Token";
  } else {
    let SessionAuth = defaultClient.authentications['SessionAuth'];
    let value = "; " + document.cookie;
    let parts = value.split("; csrftoken=");
    if (parts.length == 2) {
      value = parts.pop().split(";").shift();
    } else {
      if (typeof window !== "undefined") {
        value = window.localStorage.getItem('csrftoken');
      }
    }
    SessionAuth.apiKey = value;
  }
  defaultClient.basePath = host;
  return new TatorApi(defaultClient);
}

export default getApi;
