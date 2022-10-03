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
    library: {
      type: "module"
    },
    filename: "tator.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
	},
}
