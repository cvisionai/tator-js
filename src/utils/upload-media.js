import { uploadFile } from "./upload-file.js";
import { fetchCredentials } from "./fetch-credentials.js";
import { md5sum } from "./md5sum.js";
import { v1 as uuidv1 } from 'uuid';

async function uploadMedia(mediaType, file, opts) {
  const mediaId = opts.mediaId || null;
  const filename = opts.filename || file.name;
  const chunkSize = opts.chunkSize || 1024*1024*10;
  const fileId = opts.fileId || null;
  const progressCallback = opts.progressCallback || null;
  const uid = opts.uid || uuidv1();
  const gid = opts.gid || uuidv1();
  const section = opts.section || "New Files";
  const section_id = opts.section_id || null;
  const attributes = opts.attributes || {};
  const emailSpec = opts.emailSpec || null;
  let md5 = opts.md5 || md5sum(file);

  const projectId = mediaType.project;
  return uploadFile(projectId, file.stream(), file.size, opts)
  .then(key => fetchCredentials(
      `/rest/DownloadInfo/${projectId}?expiration=604800`, {
      method: 'POST',
      body: JSON.stringify({
        keys: [key],
      })}))
  .then(response => response.json())
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
      md5: md5,
      attributes: attributes,
      media_id: mediaId,
      size: file.size,
    };

    if(section_id){
      spec.section_id = section_id;
    } else if (section && section !== null){
      spec.section = section;
    }


    // Initiate transcode or save image.
    const ext = filename.split('.').pop();
    const isVideo = ext.match(/(mp4|avi|3gp|ogg|wmv|webm|flv|mkv|mov|mts|m4v|mpg|mp2|mpeg|mpe|mpv|m4p|qt|swf|avchd|ts)$/i);
    if (isVideo) {
      spec.email_spec = emailSpec;
      return fetchCredentials(`/rest/Transcodes/${projectId}`, {
        method: "POST",
        body: JSON.stringify(spec)
      }).then(response => response.json());
    } else {
      return fetchCredentials(`/rest/Medias/${projectId}`, {
        method: "POST",
        body: JSON.stringify([spec]),
      }).then(response => response.json());
    }
  });
}

export { uploadMedia };
