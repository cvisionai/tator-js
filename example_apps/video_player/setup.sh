#!/bin/bash

if [ -z package.json ]; then
  npm init
fi
npm install express

echo "Copying the development copy of tator.js, one could use npm here, potentially"
cp -v ../../pkg/dist/tator.js public
cp -v ../../pkg/dist/tator.min.js public
cp -v ../../pkg/dist/0.tator.js public
cp -v ../../pkg/dist/src_annotator_vid_downloader_js.tator.js public
cp -v ../../pkg/dist/src_annotator_video-codec-worker_js-src_annotator_video-codec_js.tator.js public
cp -v ../../src/annotator/vid_downloader.js public

echo "Now run \"node app.js\" and the example is running at port 3000" 
