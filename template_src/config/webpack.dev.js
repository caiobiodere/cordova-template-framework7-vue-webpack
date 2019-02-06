const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const CordovaHtmlOutputPlugin = require('../webpack/plugins/CordovaHtmlOutputPlugin.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function() {
  return webpackMerge(commonConfig({ mode: 'development' }), {
    module: {
      rules: [
        {
          test: /\.css$/, use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader"
          })
        }
      ]
    },
    plugins: [
      new CordovaHtmlOutputPlugin(),
      new ExtractTextPlugin("styles.css")
    ]
  });
}