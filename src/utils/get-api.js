import ApiClient from '../ApiClient';
import TatorApi from '../api/TatorApi';
import { getApiProxy } from './api-proxy.js';

function getApi(host=null, token=null) {
  let defaultClient = ApiClient.instance;
  if (host === null && typeof window !== 'undefined') {
    host = window.location.origin;
  }
  if (window.self !== window.top) {
    // In an iframe
    if (typeof KEYCLOAK_ENABLED === "undefined") {
      window.KEYCLOAK_ENABLED = parent.KEYCLOAK_ENABLED;
    }
    if (typeof BACKEND === "undefined") {
      window.BACKEND = parent.BACKEND;
    }
  }
  if (token) {
    let TokenAuth = defaultClient.authentications['TokenAuth'];
    TokenAuth.apiKey = token;
    TokenAuth.apiKeyPrefix = "Token";
  } else if (KEYCLOAK_ENABLED) {
    let accessToken = localStorage.getItem('access_token');
    let TokenAuth = defaultClient.authentications['TokenAuth'];
    TokenAuth.apiKey = accessToken;
    TokenAuth.apiKeyPrefix = "Bearer";
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
  const api = new TatorApi(defaultClient);
  return getApiProxy(api);
}

export { getApi };
