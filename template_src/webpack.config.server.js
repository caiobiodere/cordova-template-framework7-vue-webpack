const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CordovaHtmlOutputPlugin = require('./webpack/plugins/CordovaHtmlOutputPlugin.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const entryFile = path.join(__dirname, 'src/main.js');
const devServerPort = 8081;

module.exports = {
  entry: entryFile,
  mode: "development",

  resolve: {
    extensions: ['.js', '.json', '.vue'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      'src': path.resolve(__dirname, 'src/'),
      'assets': path.resolve(__dirname, 'src/assets/'),
      'pages': path.resolve(__dirname, 'src/assets/vue/pages/'),
      'components': path.resolve(__dirname, 'src/assets/vue/components/')
    }
  },

  output: {
    pathinfo: true,
    devtoolLineToLine: true,
    filename: '[hash].[name].js',
    sourceMapFilename: "[hash].[name].js.map",
    path: path.join(__dirname, 'www')
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]?[hash]' }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|mp3|wav)(\?.*)?$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]?[hash]' }
      },
      {
        test: /\.svg$/,
        loader: 'url-loader'
      },
      {
        test: /\.scss$/,
        loader: ['vue-style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.sass$/,
        loader: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax']
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: {
              loader: 'babel-loader',
              options: {
                presets: ['env'],
                plugins: ['transform-object-rest-spread']
              }
            }
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules(\/|\\)(?!(framework7|framework7-vue|template7|dom7)(\/|\\)).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['transform-runtime', 'transform-object-rest-spread']
          }
        }
      },
      {
        test: /\.css$/, loader: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.ejs',
      platform: process.argv.length > 5 ? process.argv[5].replace(/[- ]/g, '') : "",
      inject: true,
      minify: {
        removeComments: true,
        removeScriptTypeAttributes: true,
        removeAttributeQuotes: true,
        useShortDoctype: true,
        decodeEntities: true,
        collapseWhitespace: true,
        minifyCSS: true
      }
    }),
    new VueLoaderPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  output: {
    publicPath: "/"
  },
  devtool: "eval",
  devServer: {
    contentBase: path.join(__dirname, "www"),
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
  }
}