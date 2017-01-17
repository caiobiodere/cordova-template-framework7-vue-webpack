module.exports = function (ctx) {
	const Q = ctx.requireCordovaModule('q'),
		path = ctx.requireCordovaModule('path'),
		fs = ctx.requireCordovaModule('fs'),
		cp = ctx.requireCordovaModule('child_process'),
		os = ctx.requireCordovaModule('os'),
		ifaces = os.networkInterfaces(),
		spawn = cp.spawn,
		exec = cp.exec,
		pRoot = ctx.opts.projectRoot,
		
		nodeModulesPath = path.resolve(pRoot, "node_modules/"),
		wwwFolder = path.resolve(pRoot, "www/"),
		manifestFileSrcPath = path.resolve(pRoot, "src/manifest.json"),
		manifestFileCopyPath = path.resolve(wwwFolder, "manifest.json"),
		webpackPath = path.resolve(nodeModulesPath, ".bin/webpack"),
		webpackDevServerPath = path.resolve(nodeModulesPath, ".bin/webpack-dev-server"),
		packageJsonPath = path.resolve(__dirname, "../package.json"),
		
		packageJson = require(packageJsonPath)
	
	function getRouterIpAddr() {
		for (key in ifaces) {
			for (ipInfoKey in  ifaces[key]) {
				let ipInfo = ifaces[key][ipInfoKey]
				
				if (ipInfo.family == 'IPv4' && ipInfo.address.indexOf("192.168.") === 0 && !ipInfo.internal)
					return ipInfo.address
			}
		}
		
		return "127.0.0.1"
	}
	
	
	const sys = {
		
		toKebabCase(txt) {
			return txt.replace(/(\s)+/g, '-').replace(/[A-Z]/g, function (t) {
				return t.toLowerCase()
			})
		},
		
		checkPackageName() {
			if (typeof packageJson.name == "undefined" || packageJson.name == "") {
				packageJson.name = "hello-world"
			} else if (/\s/g.test(packageJson.name)) {
				packageJson.name = sys.toKebabCase(packageJson.name)
				fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf-8')
			}
		},
		
		deleteFolderRecursive(path, doNotDeleteSelf = false) {
			if (fs.existsSync(path)) {
				fs.readdirSync(path).forEach((file) => {
					let curPath = path + "/" + file
					if (fs.lstatSync(curPath).isDirectory())
						sys.deleteFolderRecursive(curPath);
					else
						fs.unlinkSync(curPath)
				})
				
				if (!doNotDeleteSelf)
					fs.rmdirSync(path)
			}
		},
		
		cleanWww() {
			let wwwDir = path.resolve(__dirname, "../www/")
			sys.deleteFolderRecursive(wwwDir, true)
		},
		
		checkManifestFile() {
			if (fs.existsSync(manifestFileSrcPath)) {
				console.log("Manifest.json found in src folder. Copying...")
				fs.writeFileSync(manifestFileCopyPath, fs.readFileSync(manifestFileSrcPath))
			}
		},
		
		checkNodeModules() {
			let defer = new Q.defer()
			
			console.log('Checking is node modules installed...')
			
			if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(path.resolve(nodeModulesPath, "cheerio/"))) {
				console.log('Node modules not found. Installing...')
				
				exec('npm i', {cwd: pRoot}, (error) => {
					if (error) {
						console.error(`Error happened when npm install: ${error}`);
						defer.reject(new Error(`Error happened when npm install: ${error}`))
					}
					
					console.log('Node modules installed successfully!')
					defer.resolve()
				})
			}
			else {
				console.log('Node modules already installed.')
				defer.resolve()
			}
			
			return defer.promise
		},
		
		makeNonDevServerChanges() {
			let defer = new Q.defer(),
				cheerio = require("cheerio"),
				configFile = path.resolve(__dirname, "../config.xml"),
				conf = cheerio.load(fs.readFileSync(configFile), {xmlMode: true})
			
			if (conf("allow-navigation").length > 0) {
				let target = conf("allow-navigation")
				
				if (target.attr("data-href") != "") {
					target.attr("href", target.attr("data-href"))
					target.removeAttr("data-href")
				}
			}
			
			fs.writeFileSync(configFile, conf.html(), 'utf-8')
			sys.cleanWww()
			
			defer.resolve()
			
			return defer.promise
		},
		
		makeDevServerChanges() {
			let defer = new Q.defer(),
				configFile = path.resolve(__dirname, "../config.xml"),
				srcFile = path.resolve(__dirname, "../webpack/dev_helpers/device_router.html"),
				targetFile = path.resolve(wwwFolder, "index.html"),
				
				defaultCsp = "default-src *; script-src 'self' data: 'unsafe-inline' 'unsafe-eval' http://127.0.0.1:8080 http://LOCIP:8080; object-src 'self' data: http://127.0.0.1:8080 http://LOCIP:8080; style-src 'self' 'unsafe-inline' data: ; img-src *; media-src 'self' data: http://127.0.0.1:8080 http://LOCIP:8080; frame-src 'self' data: http://127.0.0.1:8080 http://LOCIP:8080; font-src *; connect-src 'self' data: http://127.0.0.1:8080 http://LOCIP:8080",
				
				cheerio = require("cheerio"),
				$ = cheerio.load(fs.readFileSync(srcFile, 'utf-8')),
				conf = cheerio.load(fs.readFileSync(configFile), {xmlMode: true})
			
			sys.cleanWww()
			
			$('head').prepend(`<meta http-equiv="content-security-policy" content="${defaultCsp.replace(/LOCIP/g, getRouterIpAddr())}">`)
			$('body').prepend(`<script>const localServerIp = "${getRouterIpAddr()}"</script>`).append(`<script src="cordova.js"></script>`)
			fs.writeFileSync(targetFile, $.html())
			
			if (conf("allow-navigation").length == 0)
				conf("widget").append('<allow-navigation href="*" />')
			else {
				let target = conf("allow-navigation")
				
				if (target.attr("href") != "*")
					target.attr("data-href", target.attr("href")).attr("href", "*")
			}
			
			fs.writeFileSync(configFile, conf.html(), 'utf-8')
			
			defer.resolve()
			
			return defer.promise
		},
		
		startWebpackBuild(isRelease) {
			let defer = new Q.defer()
			
			console.log('Starting webpack build...')
			
			exec(webpackPath + (isRelease ? ' --env.release' : ''), {cwd: pRoot}, (error) => {
				if (error) {
					console.error(`Error happened when webpack build: ${error}`);
					defer.reject(new Error(`Error happened when webpack build: ${error}`))
				}
				
				sys.checkManifestFile()
				
				console.log('Webpack build completed to www folder successfully!')
				defer.resolve()
			})
			
			return defer.promise
		},
		
		startWebpackDevServer() {
			let defer = new Q.defer(),
				outText = "",
				isResultFound = false,
				devServerSpawn = spawn(webpackDevServerPath, ['--hot', '--inline', '--env.devserver'], {
					shell: true,
					cwd: pRoot,
					stdio: [process.stdin, 'pipe', process.stderr]
				})
			
			devServerSpawn.on('error', (err) => {
				console.log('Failed to start webpack dev server!')
				console.log(err)
				
				defer.reject(err)
			})
			
			devServerSpawn.stdout.on('data', (data) => {
				process.stdout.write(data)
				
				if (!isResultFound) {
					outText += data
					
					if (outText.indexOf('bundle is now VALID.') > -1) {
						isResultFound = true
						outText = ""
						
						defer.resolve()
					}
				}
			})
			
			return defer.promise
		},
		
		emptyDefer() {
			let defer = new Q.defer()
			
			defer.resolve()
			
			return defer.promise
		},
		
		checkOption(name) {
			return (
				typeof ctx.opts != "undefined" &&
				typeof ctx.opts.options != "undefined" &&
				typeof ctx.opts.options[name] != "undefined" &&
				ctx.opts.options[name] === true
			)
		},
		
		checkArgv(name) {
			return (
				typeof ctx.opts != "undefined" &&
				typeof ctx.opts.options != "undefined" &&
				typeof ctx.opts.options.argv != "undefined" &&
				(
					Array.isArray(ctx.opts.options.argv) &&
					ctx.opts.options.argv.indexOf(name) > -1 ||
					ctx.opts.options.argv[name] === true
				)
			)
		},
		
		isFoundInCmdline(cmdCommand) {
			return (
				ctx.cmdLine.indexOf(`cordova ${cmdCommand}`) > -1 ||
				ctx.cmdLine.indexOf(`phonegap ${cmdCommand}`) > -1
			)
		}
	}
	
	let deferral = new Q.defer(),
		isBuild = sys.isFoundInCmdline('build'),
		isRun = sys.isFoundInCmdline('run'),
		isEmulate = sys.isFoundInCmdline('emulate'),
		isPrepare = sys.isFoundInCmdline('prepare'),
		isServe = sys.isFoundInCmdline('serve'),
		isLiveReload = sys.checkArgv('--live-reload') || sys.checkArgv('--lr') || sys.checkArgv('lr') || sys.checkArgv('live-reload'),
		isNoBuild = sys.checkOption('no-build'),
		isRelease = sys.checkOption('release')
	
	if (ctx.opts.platforms.length == 0 && !isPrepare) {
		console.log("Update happened. Skipping...")
		deferral.resolve()
	}
	else {
		console.log("Before deploy hook started...")
		
		// if package name contains space characters, we'll convert it to kebab case. Required for npm install command to work.
		sys.checkPackageName()
		
		sys.checkNodeModules()
		.then(() => {
			if (isBuild || ((isRun || isEmulate || isPrepare) && !isLiveReload && !isNoBuild)) {
				return sys.makeNonDevServerChanges().then(() => sys.startWebpackBuild(isRelease))
			} else if (isServe || (isRun || isEmulate) && isLiveReload) {
				return sys.makeDevServerChanges().then(() => sys.startWebpackDevServer())
			}
			else
				return sys.emptyDefer()
		})
		.then(() => {
			console.log("Cordova hook completed. Resuming to run your cordova command...")
			deferral.resolve()
		})
		.catch((err) => {
			console.log("Error happened on main chain:")
			console.log(err)
			
			deferral.reject(err)
		})
		.done()
	}
	
	return deferral.promise
}