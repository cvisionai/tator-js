let startedRefresh = false;

async function waitForRefresh() {
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (!startedRefresh) {
        clearInterval(checkInterval);
        resolve(startedRefresh);
      }
    }, 50);
  });
}

async function getOrRefreshAccessToken() {
  let accessToken = null;
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
    // Check to see if we are using a JWT
    if (startedRefresh) {
      await waitForRefresh();
    }
    accessToken = localStorage.getItem("access_token");
    let issueTime = localStorage.getItem("issue_time");
    const expiresIn = Number(localStorage.getItem("expires_in"));
    const idToken = localStorage.getItem("id_token");
    if (accessToken !== null) {
      // We are using OIDC, check if we need a refresh
      const currentTime = new Date();
      issueTime = new Date(issueTime);
      const deltaMilliseconds = currentTime.getTime() - issueTime.getTime();
      const deltaSeconds = Math.floor(deltaMilliseconds / 1000);
      if (deltaSeconds > (expiresIn - 30)) {
        console.log(`Starting token refresh, ${deltaSeconds} since last refresh...`);
    
        startedRefresh = true;    
        const data = await fetch('/refresh', {credentials: "same-origin"})
        .then((response) => {
          if (!response.ok) {
            console.log(`Token refresh failed! Maybe your session ended.`);
            startedRefresh = false;
            localStorage.removeItem("access_token");
            localStorage.removeItem("issue_time");
            localStorage.removeItem("expires_in");
            localStorage.removeItem("id_token");
            throw new Error("Refresh failed!");
          }
          return response.json();
        })
        .catch((error) => {
          console.error(`Error refreshing token! ${error}`);
          startedRefresh = false;
          localStorage.removeItem("access_token");
          localStorage.removeItem("issue_time");
          localStorage.removeItem("expires_in");
          localStorage.removeItem("id_token");
          window.location.href = `/`;
        });
        console.log(`Token refresh succeeded! New token is good for ${data.expires_in} seconds.`);
        issueTime = new Date();
        startedRefresh = false;
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("expires_in", data.expires_in);
        localStorage.setItem("id_token", data.id_token);
        localStorage.setItem("token_type", data.token_type);
        localStorage.setItem("issue_time", issueTime.toISOString());
        accessToken = data.access_token;
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
