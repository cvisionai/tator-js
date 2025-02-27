export async function fetchRetry(url, options, retries = 5, backoff = 800) {
  try {
    // Attempt the fetch
    const response = await fetch(url, options);
    // Check if the response is okay (status in the range 200-299)
    if (response.ok) {
      return response;
    }
    // 403's and 401's won't change if you try again
    if (response.status === 403 || response.status === 401)
    {
      return response;
    }
    throw new Error('Fetch failed');
  } catch (error) {
    if (retries > 0) {
      // Wait for the backoff period
      await new Promise(resolve => setTimeout(resolve, backoff));
      // Retry with reduced number of retries and increased backoff
      return fetchRetry(url, options, retries - 1, backoff * 2);
    }
    // If no retries left, throw the last error
    throw error;
  }
}
