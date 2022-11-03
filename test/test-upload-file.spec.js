const { test, expect } = require('./fixtures.js');
const tator = require('..');
const fetch = require('fetch-readablestream');

test('Test upload file with single request', async ({ host, token, project, videoUrl }) => {
  const api = tator.getApi(host, token);
  const key = await fetch(videoUrl)
    .then(async response => {
      const contentType = response.headers.get('content-type');
      const contentSize = response.headers.get('content-length');
      const stream = response.body;
      console.log(`TYPE OF STREAM: ${typeof stream}`);
      const out = tator.uploadFile(api, project, stream, contentSize);
      return out[0];
    });
});


