import { getCookie } from "./get-cookie.js";
import { fetchRetry } from "./fetch-retry.js";
import { getOrRefreshAccessToken } from "./api-proxy.js";

function djangoCredentials() {
  return {
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };
}

async function keycloakCredentials() {
  const accessToken = await getOrRefreshAccessToken();
  return {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    }
  };
}

async function fetchCredentials(url, opts={}, retry=false, credsOnly=false) {

  // Get credentials
  let credentials;
  if (KEYCLOAK_ENABLED) {
    credentials = await keycloakCredentials();
  } else {
    credentials = djangoCredentials();
  }

  // Merge options
  let newOpts;
  if (credsOnly) {
    credKey = KEYCLOAK_ENABLED ? 'Authorization' : 'X-CSRFToken';
    newOpts = opts;
    newOpts.headers[credKey] = credentials[credKey];
  } else {
    newOpts = {...credentials, ...opts};
  }

  // Do fetch
  if (retry) {
    return fetchRetry(url, newOpts);
  } else {
    return fetch(url, newOpts);
  }
}

export { fetchCredentials };