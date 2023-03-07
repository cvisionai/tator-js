#!/bin/bash

if [ -z package.json ]; then
  npm init
fi
npm install express

cp -v ../../pkg/dist/tator.js .
