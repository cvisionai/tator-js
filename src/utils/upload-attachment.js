import { uploadFile } from './upload-file.js';
import { fetchCredentials } from './fetch-credentials.js';

export async function uploadAttachment(mediaId, file, opts) {
  let chunkSize = opts.chunkSize || 1024*1024*1;
  const name = opts.name || file.name;

  const mediaObj = await fetchCredentials(`/rest/Media/${mediaId}`).then(response => response.json());
  const projectId = mediaObj.project;
  return uploadFile(projectId, file.stream(), file.size, {
    mediaId: mediaId,
    filename: name,
    chunkSize: chunkSize,
  })
  .then(key => {
    const fileDef = {
      size: file.size,
      path: key,
      name: name,
    };
    return fetchCredentials(`/rest/AuxiliaryFiles/${mediaId}?role=attachment`, {
      method: 'POST',
      body: JSON.stringify(fileDef),
    }).then(response => response.json());
  }); 
}
