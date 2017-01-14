const path = require('path'),
	TARGET = process.env.npm_lifecycle_event,
	
	webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	CordovaHtmlOutputPlugin = require('./webpack/plugins/CordovaHtmlOutputPlugin.js'),
	UglifyJsPlugin = require('webpack-uglify-js-plugin'),
	CleanPlugin = require('clean-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin")

let config = {
	entry: path.join(__dirname, 'src/main.js'),
	
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
		filename: '[chunkhash].[name].js',
		sourceMapFilename: "[chunkhash].[name].js.map",
		path: path.join(__dirname, 'www')
	},
	
	module: {
		rules: [
			{test: /\.js?$/, loader: 'source-map-loader', enforce: 'pre'},
			{test: /\.(png|jpe?g|gif)$/, loader: 'file-loader', options: {name: '[name].[ext]?[hash]'}},
			{test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, loader: 'file-loader', options: {name: '[name].[ext]?[hash]'}},
			{test: /\.svg$/, loader: 'url-loader'},
			{
				test: /\.css$/, loader: ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				loader: "css-loader"
			})
			},
			{test: /\.s[ca]ss$/, loader: ['style-loader', 'css-loader', 'sass-loader']},
			{test: /\.json$/, loader: 'json-loader'},
			{test: /\.vue$/, loader: 'vue-loader'}
		]
	},
	
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
			filename: 'index.html',
			template: 'src/index.html',
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
		new CordovaHtmlOutputPlugin(),
		new ExtractTextPlugin("styles.css")
	]
}

if (TARGET === "watch") {
	config.devtool = "eval-source-map"
	config.watch = true
	config.watchOptions = {
		aggregateTimeout: 300,
		poll: 500,
		ignored: /(node_modules|www|platforms|plugins|hooks|webpack)/ //watch only src folder
	}
} else if (TARGET == "release") {
	config.plugins.push(new UglifyJsPlugin({
			cacheFolder: path.resolve(__dirname, 'webpack/cached_uglify/'),
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
}

module.exports = config