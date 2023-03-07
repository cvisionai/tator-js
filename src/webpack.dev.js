const path = require("path");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  mode: "development",
  experiments: {
    outputModule: true
  },
  devtool: "eval-source-map",
  devServer: {
    static: "./dist",
  },
  output: {
    libraryTarget: 'umd',
    filename: "tator.umd.js",
    path: path.resolve(__dirname, "dist"),
    clean: false,
  },
}
