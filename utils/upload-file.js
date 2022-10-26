

function uploadMulti(api, project, blob, info, numParts, chunkSize, fileSize, controller, progressCallback) {
  const gcpUpload = info.upload_id === info.urls[0];
  let promise = new Promise(resolve => resolve(true));
  for (let idx=0; idx < numParts; idx++) {
    const startByte = chunkSize * idx;
    const stopByte = Math.min(startByte + chunkSize, fileSize);
    let options = {
      method: "PUT",
      signal: controller.signal,
      credentials: "omit",
      body: blob.slice(startByte, stopByte),
    };
    if (gcpUpload) {
      const lastByte = stopByte - 1;
      const contentLength = lastByte - startByte;
      options.headers = {
        "Content-Length": contentLength.toString(),
        "Content-Range": "bytes " + startByte + "-" + lastByte + "/" + fileSize,
      };
    }
    promise = promise.then(() => {return fetchRetry(info.urls[idx], options);})
    .then(response => {
      parts.push({ETag: response.headers.get("ETag") ? response.headers.get("ETag") : "ETag", PartNumber: idx + 1});
      return parts;
    })
    .then(parts => {
      progressCallback(Math.floor(100 * idx / (numParts - 1)));
      return parts;
    });
  }
  promise = promise.then(parts => api.uploadCompletion(project, {
    key: info.key,
    upload_id: info.upload_id,
    parts: parts,
  }))
  .then(() => {return info.key;});
  return promise;
}

// Uploads using a single request.
function uploadSingle(blob, info, numParts, chunkSize, fileSize, controller, progressCallback) {
  return fetchRetry(info.urls[0], {
    method: "PUT",
    signal: controller.signal,
    credentials: "omit",
    body: this.file.slice(0, this.file.size),
  })
  .then(() => {
    progressCallback(100);
    return info.key;
  });
}

async function uploadFile(
  api, project, fileOrUrl, mediaId=null,
  filename=null, chunkSize=1024*1024*10, fileSize=null,
  fileId=null, progressCallback=null) {
  const GCP_CHUNK_MOD = 256 * 1024;

  // Check if this is a file or URL.
  const isFile = file instanceof File;
  const isString = typeof fileOrUrl === 'string' || fileOrUrl instanceof String;
  if (!isFile && !isString) {
    throw "fileOrUrl must be a File or string!";
  }
  
  // Get number of chunks.
  if (isFile && (fileSize == null || fileSize <= 0)) {
    fileSize = fileOrUrl.size;
  }
  if (Math.ceil(fileSize / chunkSize) > 10000) {
    chunkSize = Math.ceil(fileSize / 9000);
    console.warn(`Number of chunks exceeds maximum of 10,000. Increasing chunk size to ${chunkSize}.`);
  }
  if (chunkSize % GCP_CHUNK_MOD) {
    console.warn(`Chunk size must be a multiple of 256KB for Google Cloud Storage compatibility.`);
    chunkSize = Math.ceil(chunkSize / GCP_CHUNK_MOD) * GCP_CHUNK_MOD;
  }

  // Drop query portion of URL if given.
  if (isString && filename != null) {
    filename = filename.split('?')[0];
  }

  // Get upload info.
  const numChunks = Math.ceil(fileSize / chunkSize);
  const uploadParams = {numParts: numChunks};
  if (mediaId != null) {
    uploadParams.mediaId = mediaId;
  }
  if (fileId != null) {
    uploadParams.fileId = fileId;
  }
  if (filename != null) {
    uploadParams.filename = filename;
  }
  const uploadInfo = await api.getUploadInfo(project, uploadParams);

  // Functor to wrap around file versus URL
  const getData = async obj => {
    if (isFile) {
      return obj;
    } else {
      return await fetch(obj).then(response => response.blob());
    }
  };

  let controller = new AbortController();
  let promise;
  if (numChunks > 1) {
    promise = uploadMulti(
      api, project, blob, info, numParts,
      chunkSize, fileSize, controller, progressCallback,
    );
  } else {
    promise = uploadSingle(
      blob, info, numParts, chunkSize, fileSize, controller, progressCallback,
    );
  }
  return [promise, controller];
}

export default uploadFile;
