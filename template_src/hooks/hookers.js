module.exports = function (ctx) {
	const Q = ctx.requireCordovaModule('q'),
		path = ctx.requireCordovaModule('path'),
		fs = ctx.requireCordovaModule('fs'),
		cp = ctx.requireCordovaModule('child_process'),
		spawn = cp.spawn,
		exec = cp.exec,
		pRoot = ctx.opts.projectRoot,
		
		browserSyncCordovaPluginBasePath = path.resolve(pRoot, "plugins/cordova-plugin-browsersync/"),
		nodeModulesPath = path.resolve(pRoot, "node_modules/"),
		wwwFolder = path.resolve(pRoot, "www/"),
		manifestFileSrcPath = path.resolve(pRoot, "src/manifest.json"),
		manifestFileCopyPath = path.resolve(wwwFolder, "manifest.json"),
		webpackPath = path.resolve(nodeModulesPath, ".bin/webpack")
	
	const sys = {
		
		checkManifestFile() {
			if (fs.existsSync(manifestFileSrcPath)) {
				console.log("Manifest.json found in src folder. Copying...")
				fs.writeFileSync(manifestFileCopyPath, fs.readFileSync(manifestFileSrcPath))
			}
		},
		
		checkNodeModules() {
			let defer = new Q.defer()
			
			console.log('Checking is node modules installed...')
			
			if (!fs.existsSync(nodeModulesPath)) {
				console.log('Node modules not found. Installing...')
				
				exec('npm i', {cwd: ctx.opts.projectRoot}, (error) => {
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
		
		checkBrowserSync() {
			let defer = new Q.defer()
			
			console.log('Checking is browsersync plugin installed...')
			
			if (!fs.existsSync(browserSyncCordovaPluginBasePath)) {
				console.log('Browsersync plugin not found. Installing...')
				
				exec('cordova plugin add cordova-plugin-browsersync', {cwd: ctx.opts.projectRoot}, (error) => {
					if (error) {
						console.error(`Error happened when browsersync install: ${error}`);
						defer.reject(new Error(`Error happened when browsersync install: ${error}`))
					}
					
					console.log('Browsersync installed successfully!')
					defer.resolve()
				})
			}
			else {
				console.log('Browsersync already installed.')
				defer.resolve()
			}
			
			return defer.promise
		},
		
		startWebpackBuild(isRelease) {
			let defer = new Q.defer()
			
			console.log('Starting webpack build...')
			
			exec(webpackPath + (isRelease ? ' --release' : ''), {cwd: ctx.opts.projectRoot}, (error) => {
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
		
		startWebpackWatch() {
			let defer = new Q.defer(),
				outText = "",
				isResultFound = false,
				wpSpawn = spawn(webpackPath, ['--watch'], {
					shell: true,
					cwd: ctx.opts.projectRoot,
					stdio: [process.stdin, 'pipe', 'pipe']
				})
			
			wpSpawn.on('error', (err) => {
				console.log('Failed to start webpack watcher!')
				console.log(err)
				
				defer.reject(err)
			})
			
			wpSpawn.stdout.on('data', (data) => {
				process.stdout.write(data)
				
				if (!isResultFound) {
					outText += data
					
					if (outText.indexOf('Child html-webpack-plugin for') > -1) {
						isResultFound = true
						outText = ""
						
						setTimeout(() => {
							sys.checkManifestFile()
							console.log('Webpack is watching your src folder...')
						}, 500)
						
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
				Array.isArray(ctx.opts.options.argv) &&
				ctx.opts.options.argv.indexOf(name) > -1
			)
		}
	}
	
	let deferral = new Q.defer(),
		isBuild = ctx.cmdLine.indexOf('cordova build') > -1,
		isRun = ctx.cmdLine.indexOf('cordova run') > -1,
		isEmulate = ctx.cmdLine.indexOf('cordova emulate') > -1,
		isPrepare = ctx.cmdLine.indexOf('cordova prepare') > -1,
		isLiveReload = sys.checkArgv('--live-reload'),
		isNoBuild = sys.checkOption('no-build'),
		isRelease = sys.checkOption('release')
	
	fs.writeFileSync(path.resolve(__dirname, "../ctxx.json"), JSON.stringify(ctx))
	
	if (ctx.opts.platforms.length == 0 && !isPrepare) {
		console.log("Update happened. Skipping...")
		deferral.resolve()
	}
	else {
		console.log("Before deploy hook started...")
		
		sys.checkNodeModules()
		.then(() => sys.checkBrowserSync())
		.then(() => {
			if (isBuild || ((isRun || isEmulate || isPrepare) && !isLiveReload && !isNoBuild))
				return sys.startWebpackBuild(isRelease)
			else if ((isRun || isEmulate) && isLiveReload)
				return sys.startWebpackWatch()
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