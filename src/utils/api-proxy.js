
const handler = {
  get: function(target, prop, receiver) {
    const originalMethod = target[prop];
    if (typeof originalMethod === "function") {
      return async function (...args) {
        // Check to see if we are using a JWT
        let accessToken = localStorage.getItem("access_token");
        let issueTime = localStorage.getItem("issue_time");
        const expiresIn = localStorage.getItem("expires_in");
        const idToken = localStorage.getItem("id_token");
        if (accessToken !== null) {
          // We are using OIDC, check if we need a refresh
          const currentTime = new Date();
          issueTime = new Date(issueTime);
          const deltaMilliseconds = currentTime.getTime() - issueTime.getTime();
          const deltaSeconds = Math.floor(deltaMilliseconds / 1000);
          if (deltaSeconds > (expiresIn - 30)) {
            const data = await fetch('/refresh')
            .then((response) => {
              if (!response.ok) {
                throw new Error("Refresh failed!");
              }
              return response.json();
            })
            .catch((error) => {
              console.error("Error refreshing token!");
              window.location.href = "/accounts/login";
            });
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("expires_in", data.expires_in);
            localStorage.setItem("id_token", data.id_token);
            localStorage.setItem("token_type", data.token_type);
            localStorage.setItem("issue_time", issueTime.toISOString());
            let TokenAuth = target.apiClient.authentications['TokenAuth'];
            TokenAuth.apiKey = data.access_token;
            TokenAuth.apiKeyPrefix = "Bearer";
          }
        }
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

export { getApiProxy };
