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
		manifestFileCopyPath = path.resolve(wwwFolder, "manifest.json")
	
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
			
			exec('webpack' + (isRelease ? ' release' : '') , {cwd: ctx.opts.projectRoot}, (error) => {
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
			console.log('Starting webpack watch...')
			
			let defer = new Q.defer(),
				outText = "",
				isResultFound = false,
				wpSpawn = spawn('webpack', ['watch'], {cwd: ctx.opts.projectRoot, stdio:[process.stdin, 'pipe', 'pipe']})
			
			wpSpawn.on('error', (err) => {
				console.log('Failed to start webpack watcher!')
				console.log(err)
				
				defer.reject(err)
			})
			
			wpSpawn.stdout.on('data', (data) => {
				process.stdout.write(data)
				
				if( !isResultFound ) {
					outText += data
					
					if( outText.indexOf('Child html-webpack-plugin for') > -1 ) {
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
		}
	}
	
	let deferral = new Q.defer();
	
	console.log("Before deploy hook started...")
	
	sys.checkNodeModules()
	.then(() => sys.checkBrowserSync())
	.then(() => {
		let isBuild = ctx.cmdLine.indexOf('cordova build') > -1,
				isRun = ctx.cmdLine.indexOf('cordova run') > -1,
				isEmulate = ctx.cmdLine.indexOf('cordova emulate') > -1,
				isServe = ctx.cmdLine.indexOf('cordova serve') > -1,
				isLiveReload = ( typeof ctx.opts != "undefined" && typeof ctx.opts.options["live-reload"] != "undefined" && ctx.opts.options["live-reload"] === true ),
				isNoBuild = ( typeof ctx.opts != "undefined" && typeof ctx.opts.options["no-build"] != "undefined" && ctx.opts.options["no-build"] === true ),
				isRelease = ( typeof ctx.opts != "undefined" && typeof ctx.opts.options["release"] != "undefined" && ctx.opts.options["release"] === true )
		
		if( isBuild || ((isRun || isEmulate || isServe) && !isLiveReload && !isNoBuild) )
			return sys.startWebpackBuild(isRelease)
		else if( (isRun || isEmulate || isServe) && isLiveReload )
			return sys.startWebpackWatch()
		else
			return sys.emptyDefer()
	})
	.then(() => {
		console.log("Cordova hook completed. Resuming to run your cordova command...")
		deferral.resolve()
	})
	.catch( (err) => {
		console.log("Error happened on main chain:")
		console.log(err)
		
		deferral.reject(err)
	})
	.done()
	
	return deferral.promise
}