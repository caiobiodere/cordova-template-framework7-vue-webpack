const path = require('path'),
	webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	CordovaHtmlOutputPlugin = require('../plugins/CordovaHtmlOutputPlugin'),
	UglifyJsPlugin = require('webpack-uglify-js-plugin'),
	CleanPlugin = require('clean-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin"),
	TARGET = process.env.npm_lifecycle_event

const config = {
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(TARGET == "release" ? 'production' : 'development')
			}
		}),
		new CleanPlugin("www", {
			root: path.join(__dirname, "../../")
		}),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html', template: 'src/index.html', inject: true, minify: {
				removeComments: true,
				removeScriptTypeAttributes: true,
				removeAttributeQuotes: true,
				useShortDoctype: true,
				decodeEntities: true,
				collapseWhitespace: true,
				minifyCSS: true
			}
		}),
		new CordovaHtmlOutputPlugin(),
		new ExtractTextPlugin("styles.css")
	]
}

if (TARGET == "release")
	config.plugins.push(new UglifyJsPlugin({
			cacheFolder: path.resolve(__dirname, '../cached_uglify/'),
			debug: true,
			minimize: true,
			sourceMap: false,
			output: {
				comments: false
			},
			compressor: {
				warnings: false
			}
		}
	))

module.exports = config