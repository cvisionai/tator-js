import { uploadFile } from "./upload-file.js";
import { md5sum } from "./md5sum.js";
import { v1 as uuidv1 } from "uuid";

async function uploadMedia(api, mediaType, file, opts) {
  const mediaId = opts.mediaId || null;
  const filename = opts.filename || file.name;
  const chunkSize = opts.chunkSize || 1024*1024*10;
  const fileId = opts.fileId || null;
  const progressCallback = opts.progressCallback || null;
  const uid = opts.uid || uuidv1();
  const gid = opts.gid || uuidv1();
  const section = opts.section || "New Files";
  const attributes = opts.attributes || {};
  let md5 = opts.md5 || md5sum(file);

  const projectId = mediaType.project;
  return uploadFile(api, projectId, file.stream(), file.size, opts)
  .then(key => api.getDownloadInfo(projectId, {
      keys: [key],
      expiration: 86400
    }))
  .then(async info => {
    const url = info[0].url;
    if (md5 instanceof Promise) {
      md5 = await md5;
    }
    let spec = {
      type: mediaType.id,
      uid: uid,
      gid: gid,
      url: url,
      name: filename,
      section: section,
      md5: md5,
      attributes: attributes,
      mediaId: mediaId,
      size: file.size,
    };
    // Initiate transcode or save image.
    if (file.type.startsWith('video')) {
      return api.transcode(projectId, spec);
    } else {
      return api.createMediaList(projectId, [spec]);
    }
  });
}

export { uploadMedia };