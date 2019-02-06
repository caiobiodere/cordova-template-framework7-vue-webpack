const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = function() {
  return webpackMerge(commonConfig({ mode: 'production' }), {
    plugins: [
      new UglifyJsPlugin(),
      new CleanPlugin("www", {
        root: path.join(__dirname, "."),
        dry: false,
        verbose: false,
        exclude: ["index.html"]
      })
    ]
  });
}