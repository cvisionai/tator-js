const path = require("path");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  mode: "production",
  output: {
    filename: "tator.min.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
	},
}
