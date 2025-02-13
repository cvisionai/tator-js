import { fetchRetry } from "./fetch-retry.js";

// A shared promise variable for an in-progress token refresh.
let tokenRefreshPromise = null;

async function getOrRefreshAccessToken() {
  let accessToken = null;

  // If running inside an iframe, inherit configuration from the parent.
  if (window.self !== window.top) {
    if (typeof KEYCLOAK_ENABLED === "undefined") {
      window.KEYCLOAK_ENABLED = parent.KEYCLOAK_ENABLED;
    }
    if (typeof BACKEND === "undefined") {
      window.BACKEND = parent.BACKEND;
    }
  }

  if (KEYCLOAK_ENABLED) {
    // If a token refresh is already in progress, wait for it.
    if (tokenRefreshPromise !== null) {
      await tokenRefreshPromise;
    }

    // Retrieve the current token information from localStorage.
    accessToken = localStorage.getItem("access_token");
    const storedIssueTime = localStorage.getItem("issue_time");
    const expiresIn = Number(localStorage.getItem("expires_in"));

    if (accessToken !== null && storedIssueTime) {
      // Calculate the elapsed time (in seconds) since the token was issued.
      const currentTime = new Date();
      const issueTime = new Date(storedIssueTime);
      const deltaSeconds = Math.floor((currentTime.getTime() - issueTime.getTime()) / 1000);

      // If 75% of expiration time has passed, refresh the token.
      if (deltaSeconds > (0.75 * expiresIn)) {
        console.log(`Starting token refresh, ${deltaSeconds} seconds since token issuance...`);

        // Only initiate a refresh if one is not already in progress.
        if (tokenRefreshPromise === null) {
          tokenRefreshPromise = (async () => {
            try {
              const response = await fetchRetry('/refresh', { credentials: "same-origin" });
              if (!response.ok) {
                console.log(`Token refresh failed! Session may have ended.`);
                // Clean up token-related data.
                localStorage.removeItem("access_token");
                localStorage.removeItem("issue_time");
                localStorage.removeItem("expires_in");
                localStorage.removeItem("id_token");
                throw new Error("Refresh failed!");
              }

              const data = await response.json();
              console.log(`Token refresh succeeded! New token valid for ${data.expires_in} seconds.`);

              // Update localStorage with the new token data.
              const newIssueTime = new Date();
              localStorage.setItem("access_token", data.access_token);
              localStorage.setItem("expires_in", data.expires_in);
              localStorage.setItem("id_token", data.id_token);
              localStorage.setItem("token_type", data.token_type);
              localStorage.setItem("issue_time", newIssueTime.toISOString());
            } catch (error) {
              console.error(`Error refreshing token: ${error}`);
              // Clear token data on failure.
              localStorage.removeItem("access_token");
              localStorage.removeItem("issue_time");
              localStorage.removeItem("expires_in");
              localStorage.removeItem("id_token");

              // Optionally, store a post-login path and redirect.
              const expiresAt = new Date();
              expiresAt.setMinutes(expiresAt.getMinutes() + 10);
              console.log(`Storing post login path as ${window.location.pathname}, expires at ${expiresAt}`);
              localStorage.setItem("postLoginPath", window.location.pathname);
              localStorage.setItem("postLoginPathExpiresAt", expiresAt.toString());
              window.location.href = `/`;
              throw error;
            } finally {
              // Reset the shared promise once the refresh is complete.
              tokenRefreshPromise = null;
            }
          })();
        }
        // Wait for the refresh promise to complete.
        await tokenRefreshPromise;
        // After refresh, retrieve the updated token.
        accessToken = localStorage.getItem("access_token");
      }
    }
  }

  return accessToken;
}

const handler = {
  get: function(target, prop, receiver) {
    const originalMethod = target[prop];
    if (typeof originalMethod === "function") {
      return async function (...args) {
        const accessToken = await getOrRefreshAccessToken();
        let TokenAuth = target.apiClient.authentications['TokenAuth'];
        TokenAuth.apiKey = accessToken;
        TokenAuth.apiKeyPrefix = "Bearer";
        return originalMethod.apply(target, args);
      }
    } else {
      return Reflect.get(target, prop, receiver);
    }
  }
}

function getApiProxy(api) {
  return new Proxy(api, handler);
}

export { getOrRefreshAccessToken, getApiProxy };
