const path = require('path')

module.exports = {
  entry: "./src/app.ts",
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,     // tells webpack to check for files that end in .ts
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']      // tells webpack to bundle all files with these extensions
  }
};