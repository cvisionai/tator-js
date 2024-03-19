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

function hasHost(url) {
  if (typeof url === "string") {
    return url.startsWith("http");
  } else {
    return true;
  }
}

async function fetchCredentials(url, opts={}, retry=false, credsOnly=false) {

  // Get credentials
  let credentials;
  if (window.self !== window.top) {
    // In an iframe
    if (typeof KEYCLOAK_ENABLED === "undefined") {
      window.KEYCLOAK_ENABLED = parent.KEYCLOAK_ENABLED;
    }
    if (typeof BACKEND === "undefined") {
      window.BACKEND = parent.BACKEND;
    }
  }
  if (KEYCLOAK_ENABLED) {
    credentials = await keycloakCredentials();
  } else {
    credentials = djangoCredentials();
  }

  // Merge options
  let newOpts;
  if (credsOnly) {
    const credKey = KEYCLOAK_ENABLED ? 'Authorization' : 'X-CSRFToken';
    newOpts = opts;
    newOpts.headers[credKey] = credentials.headers[credKey];
  } else {
    newOpts = {...credentials, ...opts};
  }

  // Set host in URL
  if (window.BACKEND && !hasHost(url)) {
    url = window.BACKEND + url;
  }

  // Do fetch
  if (retry) {
    return fetchRetry(url, newOpts);
  } else {
    return fetch(url, newOpts);
  }
}

export { fetchCredentials };
