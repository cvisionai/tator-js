import { fetchRetry } from "./fetch-retry.js";
import { fetchCredentials } from "./fetch-credentials.js";

function makeReaderWithFixedChunks(reader, chunkSize) {
  let buffer;
  const stream = new ReadableStream({
    async pull(controller) {
      let full = false;

      while (!full) {
        const status = await reader.read();

        if (!status.done) {
          const chunk = status.value;
          buffer = new Uint8Array([...(buffer || []), ...chunk]);

          while (buffer.byteLength >= chunkSize) {
            const chunkToSend = buffer.slice(0, chunkSize);
            controller.enqueue(chunkToSend);
            buffer = new Uint8Array([...buffer.slice(chunkSize)]);
            full = true;
          }
        }
        if (status.done) {
          full = true;
          if (buffer.byteLength > 0) {
            controller.enqueue(buffer);
          }
          controller.close();
        }
      }
    },
  });
  return stream.getReader();
}

function uploadMulti(project, stream, size, info, numChunks, chunkSize, progressCallback, abortController) {
  const gcpUpload = info.upload_id === info.urls[0];
  const msUpload = info.urls[0].includes("blob.core.windows.net");
  let promise = new Promise(resolve => resolve(true));
  const reader = makeReaderWithFixedChunks(stream.getReader(), chunkSize);
  const parts = [];
  let startByte = 0;
  let stopByte = 0;
  for (let idx=0; idx < numChunks; idx++) {
    promise = promise
    .then(() => reader.read())
    .then(status => {
      let options = {
        method: "PUT",
        credentials: "omit",
        body: status.value,
        signal: abortController.signal,
      };
      if (gcpUpload) {
        const contentLength = status.value.length;
        stopByte = startByte + contentLength;
        options.headers = {
          "Content-Length": contentLength.toString(),
          "Content-Range": "bytes " + startByte + "-" + stopByte + "/" + size,
        };
        startByte += contentLength;
      }
      if (msUpload) {
        options.headers = {
          "x-ms-blob-type": "BlockBlob",
        };
      }
      
      return fetchRetry(info.urls[idx], options);
    })
    .then(response => {
      parts.push({ETag: response.headers.get("ETag") ? response.headers.get("ETag") : "ETag", PartNumber: idx + 1});
      return parts;
    })
    .then(parts => {
      progressCallback(Math.floor(100 * idx / (numChunks - 1)));
      return parts;
    });
  }
  promise = promise.then(parts => {
    return fetchCredentials(`/rest/UploadCompletion/${project}`, {
      method: "POST",
      body: JSON.stringify({
        key: info.key,
        upload_id: info.upload_id,
        parts: parts,
      }),
    });
  })
  .then(response => response.json())
  .then(() => {return info.key;});
  return promise;
}

// Uploads using a single request.
async function uploadSingle(stream, size, info, progressCallback, abortController) {
  const msUpload = info.urls[0].includes("blob.core.windows.net");
  const reader = makeReaderWithFixedChunks(stream.getReader(), size);
  const options = {
    method: "PUT",
    credentials: "omit",
    body: status.value,
    signal: abortController.signal,
  }
  if (msUpload) {
    options.headers = {
      "x-ms-blob-type": "BlockBlob",
    };
  }
  return reader.read().then(status => {
    return fetchRetry(info.urls[0], options);
  })
  .then(() => {
    if (progressCallback !== null) {
      progressCallback(100);
    }
    return info.key;
  });
}

async function uploadFile(project, stream, size, opts={}) {
  // Get options
  const mediaId = opts.mediaId || null;
  const filename = opts.filename || null;
  let chunkSize = opts.chunkSize || 1024*1024*10;
  const fileId = opts.fileId || null;
  const progressCallback = opts.progressCallback || null;
  const abortController = opts.abortController || new AbortController();

  const GCP_CHUNK_MOD = 256 * 1024;

  if (Math.ceil(size / chunkSize) > 10000) {
    chunkSize = Math.ceil(size / 9000);
    console.warn(`Number of chunks exceeds maximum of 10,000. Increasing chunk size to ${chunkSize}.`);
  }
  if (chunkSize % GCP_CHUNK_MOD) {
    console.warn(`Chunk size must be a multiple of 256KB for Google Cloud Storage compatibility.`);
    chunkSize = Math.ceil(chunkSize / GCP_CHUNK_MOD) * GCP_CHUNK_MOD;
  }

  // Get upload info.
  const numChunks = Math.ceil(size / chunkSize);
  let url = `/rest/UploadInfo/${project}?num_parts=${numChunks}`;
  if (mediaId != null) {
    url += `&media_id=${mediaId}`;
  }
  if (fileId != null) {
    url += `&file_id=${fileId}`;
  }
  if (filename != null) {
    url += `&filename=${filename}`;
  }
  return fetchCredentials(url)
  .then(response => response.json())
  .then(info => {
    let promise;
    if (numChunks > 1) {
      promise = uploadMulti(
        project, stream, size, info, numChunks,
        chunkSize, progressCallback, abortController,
      );
    } else {
      promise = uploadSingle(
        stream, size, info, progressCallback, abortController,
      );
    }
    return promise;
  });
}

export { uploadFile };
