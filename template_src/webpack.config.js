const path = require('path'),
	merge = require('webpack-merge'),
	ExtractTextPlugin = require("extract-text-webpack-plugin"),
	TARGET = process.env.npm_lifecycle_event,
	confPath = path.resolve(__dirname, "webpack/configs/")

const baseConfig = {
	entry: path.join( __dirname, 'src/main.js' ),
	
	resolve: {
		extensions: ['.js', '.json', '.vue'],
		modules: [path.join(__dirname, 'src'), 'node_modules'],
		alias: {
			'vue$': 'vue/dist/vue.common.js',
			'src': path.resolve(__dirname, 'src'),
			'assets': path.resolve(__dirname, 'src/assets'),
			'pages': path.resolve(__dirname, 'src/assets/vue/pages'),
			'components': path.resolve(__dirname, 'src/assets/vue/components')
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
			{test: /\.(png|jpe?g|gif)$/, loader: 'file-loader', options: { name: '[name].[ext]?[hash]' }},
			{test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, loader: 'file-loader', options: { name: '[name].[ext]?[hash]' }},
			{test: /\.svg$/, loader: 'url-loader'},
			{test: /\.css$/, loader: ExtractTextPlugin.extract({
				fallbackLoader: "style-loader",
				loader: "css-loader"
			}) },
			{test: /\.s[ca]ss$/, loader: ['style-loader', 'css-loader', 'sass-loader']},
			{test: /\.json$/, loader: 'json-loader'},
			{test: /\.vue$/, loader: 'vue-loader' }
		]
	}
}

if(TARGET === "watch")
	module.exports = merge.smart( baseConfig, require(path.join(confPath, 'watch.config.js')) )
else
	module.exports = merge.smart( baseConfig, require(path.join(confPath, 'build.config.js')) )

