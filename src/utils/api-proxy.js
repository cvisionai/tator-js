import { fetchRetry } from "./fetch-retry.js";

// A shared promise variable for an in-progress token refresh.
let tokenRefreshPromise = null;

async function getOrRefreshAccessToken(forceRefresh = false) {
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

    // Determine if refresh is needed
    const shouldRefresh =
      forceRefresh ||
      !accessToken ||
      !storedIssueTime ||
      (storedIssueTime && Math.floor((new Date().getTime() - new Date(storedIssueTime).getTime()) / 1000) > 0.75 * expiresIn);

    if (shouldRefresh) {
      console.log("Starting token refresh...");
      if (tokenRefreshPromise === null) {
        tokenRefreshPromise = (async () => {
          let refreshFailed = false;
          try {
            const response = await fetchRetry("/refresh", { credentials: "same-origin" });
            if (!response.ok) {
              console.log("Token refresh failed! Session may have ended.");
              refreshFailed = true;
              throw new Error("Refresh failed!");
            }
            const data = await response.json();
            console.log(`Token refresh succeeded! New token valid for ${data.expires_in} seconds.`);
            const newIssueTime = new Date();
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("expires_in", data.expires_in);
            localStorage.setItem("id_token", data.id_token);
            localStorage.setItem("token_type", data.token_type);
            localStorage.setItem("issue_time", newIssueTime.toISOString());
            accessToken = data.access_token;
          } catch (error) {
            console.error(`Error refreshing token: ${error}`);
            refreshFailed = true;
            localStorage.removeItem("access_token");
            localStorage.removeItem("issue_time");
            localStorage.removeItem("expires_in");
            localStorage.removeItem("id_token");
            throw error; // Re-throw to be caught by the caller
          } finally {
            tokenRefreshPromise = null; // Reset the shared promise
            if (refreshFailed) {
              // Defer redirect until after promise resolution
              const expiresAt = new Date();
              expiresAt.setMinutes(expiresAt.getMinutes() + 10);
              console.log(`Storing post login path as ${window.location.pathname}, expires at ${expiresAt}`);
              localStorage.setItem("postLoginPath", window.location.pathname);
              localStorage.setItem("postLoginPathExpiresAt", expiresAt.toString());
              window.location.href = `/`; // Redirect happens after finally
            }
          }
          return accessToken;
        })();
      }
      try {
        await tokenRefreshPromise; // Wait for refresh to complete
        accessToken = localStorage.getItem("access_token"); // Update token after refresh
      } catch (error) {
        // If refresh fails, the finally block in tokenRefreshPromise handles the redirect
        throw error; // Propagate error to caller (fetchCredentials)
      }
    }
  }

  return accessToken;
}

const handler = {
  get: function (target, prop, receiver) {
    const originalMethod = target[prop];
    if (typeof originalMethod === "function") {
      return async function (...args) {
        const accessToken = await getOrRefreshAccessToken();
        let TokenAuth = target.apiClient.authentications["TokenAuth"];
        TokenAuth.apiKey = accessToken;
        TokenAuth.apiKeyPrefix = "Bearer";
        return originalMethod.apply(target, args);
      };
    } else {
      return Reflect.get(target, prop, receiver);
    }
  },
};

function getApiProxy(api) {
  return new Proxy(api, handler);
}

export { getOrRefreshAccessToken, getApiProxy };
