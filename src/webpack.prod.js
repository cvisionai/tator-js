const path = require("path");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    libraryTarget: 'umd',
    filename: "tator.umd.min.js",
    path: path.resolve(__dirname, "dist"),
    clean: false,
  },
}
