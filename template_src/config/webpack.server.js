const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const devServerPort = 8081;

module.exports = function() {
  return webpackMerge(commonConfig({ mode: 'development' }), {
    module: {
      rules: [
        {
          test: /\.css$/, loader: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new webpack.NamedModulesPlugin()
    ],
    devServer: {
      contentBase: path.join(__dirname, "../www"),
      port: devServerPort,
      stats: { colors: true },
      watchOptions: {
          aggregateTimeout: 300,
          poll: 100,
          ignored: /node_modules|platforms/,
      },
      headers: {
          "Access-Control-Allow-Origin": "*"
      },
      host: "0.0.0.0"
    },
    output: {
      publicPath: "/"
    }
  });
}