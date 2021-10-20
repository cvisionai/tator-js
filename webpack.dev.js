const path = require("path");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
  },
  output: {
    filename: "tator.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
	},
}
