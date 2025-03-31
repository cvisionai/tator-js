import { getCookie } from "./get-cookie.js";
import { fetchRetry } from "./fetch-retry.js";
import { getOrRefreshAccessToken } from "./api-proxy.js";

function djangoCredentials() {
  return {
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  };
}

async function keycloakCredentials() {
  const accessToken = await getOrRefreshAccessToken();
  return {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  };
}

function hasHost(url) {
  if (typeof url === "string") {
    return url.startsWith("http");
  } else {
    return true;
  }
}

async function fetchCredentials(url, opts = {}, retry = false, credsOnly = false) {
  // Get credentials
  let credentials;
  if (window.self !== window.top) {
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
  let newOpts = { ...opts };
  if (credsOnly) {
    const credKey = KEYCLOAK_ENABLED ? "Authorization" : "X-CSRFToken";
    newOpts.headers = { ...newOpts.headers, [credKey]: credentials.headers[credKey] };
  } else {
    newOpts.headers = { ...credentials.headers, ...newOpts.headers };
  }

  // Set host in URL
  if (window.BACKEND && !hasHost(url)) {
    url = window.BACKEND + url;
  }

  // Perform fetch and handle 401
  const doFetch = retry ? fetchRetry : fetch;
  const response = await doFetch(url, newOpts);

  if (response.status === 401 && KEYCLOAK_ENABLED) {
    // Clone the response so we can read the body without consuming the original
    const clonedResponse = response.clone();
    let responseData = null;
    let isUserDisabled = false;

    try {
        // Attempt to read the body as JSON
        responseData = await response.json(); // Read from the original response stream

        // Check if the response data contains a specific error code
        if (responseData && responseData.error && responseData.error == "User disabled") {
            console.log(`Received user diabled 401 error. Skipping token refresh.`);
            isUserDisabled = true;
        } else {
            console.log("Received standard 401 (or unknown body format). Attempting token refresh...");
        }
    } catch (error) {
        // Handle cases where the body isn't valid JSON or is empty
        console.warn("Could not parse 401 response body as JSON, treating as standard 401.", error);
        // Proceed with refresh attempt by default if body parsing fails
    }

    // If it's a special 401 we identified, return the cloned response immediately
    if (isUserDisabled) {
        // Return the CLONED response, as the original's body stream may have been consumed
        return clonedResponse;
    }
    
    console.log("Received 401 - Attempting token refresh...");
    try {
      const newAccessToken = await getOrRefreshAccessToken(true); // Force refresh
      if (newAccessToken) {
        newOpts.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("Retrying request with refreshed token...");
        return await doFetch(url, newOpts); // Retry with new token
      } else {
        console.log("No new token available after refresh attempt.");
        return response; // Return original 401 response if refresh yields no token
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return response; // Return the 401 response, redirect will happen via api-proxy
    }
  }

  return response;
}

export { fetchCredentials };
