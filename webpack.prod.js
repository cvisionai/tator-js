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
    library: {
      type: "module"
    },
    filename: "tator.min.js",
    path: path.resolve(__dirname, "dist"),
    clean: false,
  },
}
