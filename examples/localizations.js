#!/usr/bin/env node

const yargs = require('yargs');

const Tator = require('..');

const argv = yargs
  .option('host', {
    alias: 's',
    description: 'Tator host URL',
    type: 'string',
    default: 'https://cloud.tator.io'
  })
  .option('token', {
    alias: 't',
    description: 'Your API token',
    type: 'string',
    demandOption: true
  })
  .option('video-id', {
    description: "Video ID",
    type: 'integer',
    demandOption: true
  })
  .option('type-id', {
    description: "Localization type ID",
    type: 'integer',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;

function logAndExit(error) {
  console.log(error);
  return process.exit(1);
}

function logMessageReturnId(resp) {
  console.log(resp.message);
  return resp.id;
}

function randomBox(video, typeId) {
  // Returns random localization spec for given video object.
  let x = Math.random()
  let y = Math.random()
  return {
    x: x,
    y: y,
    width: Math.random() * (1.0 - x),
    height: Math.random() * (1.0 - y),
    frame: Math.floor(Math.random() * video.num_frames),
    media_id: video.id,
    type: typeId,
  };
}

let api = Tator.Utils.getApi(argv.host, argv.token);

// Get the video and type objects.
let promise = Promise.all([
  api.getMedia(argv.videoId),
  api.getLocalizationType(argv.typeId)
])
.then(async ([video, locType]) => {
  let project = locType.project;

  // Create a list of random box localizations.
  let localizations = [];
  for (let i = 0; i < 5000; i++) {
    localizations.push(randomBox(video, argv.typeId));
  }

  // Create the localizations. A maximum of 500 localizations can be created 
  // per request.
  for (let i = 0; i < 5000; i += 500) {
    let spec = localizations.slice(i, i+500);
    //console.log(spec);
    await api.createLocalizationList(project, localizationSpec=spec)
    .then(logMessageReturnId, logAndExit);
  }

  // Get all localizations for this video. The `media_id` parameter accepts a list
  // of IDs.
  await api.getLocalizationList(project, {mediaId: [argv.videoId]})
  .then(localizations => {
    console.log(`Found ${localizations.length} localizations in this video!`);
  });

  // Get the localizations with left edge on the left side of the image.
  // Geometry fields are indexed in elasticsearch with a leading underscore
  // appended before their name.
  await api.getLocalizationList(project, {mediaId: [argv.videoId], search: "_x:<0.5"})
  .then(localizations => {
    console.log(`Found ${localizations.length} localizations on left side of video!`);
  });

  // Get the localizations with normalized width less than 0.25.
  await api.getLocalizationList(project, {mediaId: [argv.videoId], search: "_width:<0.25"})
  .then(localizations => {
    console.log(`Found ${localizations.length} localizations with width < 0.25!`);
  });

  // Get the localizations between frames 100-200.
  // Frame is also indexed in elasticsearch under the name _frame.
  await api.getLocalizationList(project, {mediaId: [argv.videoId],
                          search: "_frame:>=100 AND _frame:<=200"})
  .then(localizations => {
    console.log(`Found ${localizations.length} localizations between frames 100-200!`);
  });

  // Delete localizations between frames 100-200.
  await api.deleteLocalizationList(project, {mediaId: [argv.videoId],
                             search: "_frame:>=100 AND _frame:<=200"})
  .then(logMessageReturnId, logAndExit);

  // Suppose we want to shrink the first 10 boxes by 50% in each dimension. This
  // can be done by iterating over them and patching them.
  await api.getLocalizationList(project, {mediaId: [argv.videoId]})
  .then(async localizations => {
    for (const loc of localizations.slice(0, 10)) {
      update = {width: loc.width * 0.5, height: loc.height * 0.5};
      await api.updateLocalization(loc.id, localizationUpdate=update)
      .then(logMessageReturnId, logAndExit);
    }
  });
});
