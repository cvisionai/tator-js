#!/bin/bash

if [ -z package.json ]; then
  npm init
fi
npm install express

echo "Copying the development copy of tator.js, one could use npm here, potentially"
cp -v ../../pkg/dist/tator.js public

echo "Now run `node app.js` and the example is running at port 3000" 
