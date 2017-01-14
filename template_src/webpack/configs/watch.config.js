const path = require('path'),
	webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	CordovaHtmlOutputPlugin = require('../plugins/CordovaHtmlOutputPlugin.js'),
	CleanPlugin = require('clean-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin")

const config = {
	devtool: "eval-source-map",
	watch: true,
	watchOptions: {
		aggregateTimeout: 300,
		poll: 500,
		ignored: /(node_modules|www|platforms|plugins|hooks|webpack)/ //watch only src folder
	},
	
	plugins: [
		new webpack.DefinePlugin({
			'process.env':{
				'NODE_ENV': JSON.stringify('development')
			}
		}),
		new CleanPlugin("www", {
			root: path.join(__dirname, "../../")
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/index.html',
			inject: true
		}),
		new CordovaHtmlOutputPlugin(),
		new ExtractTextPlugin("styles.css")
	]
}

module.exports = config