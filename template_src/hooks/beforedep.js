module.exports = function (ctx) {
	const Q = require('q'),
		path = require('path'),
		fs = require('fs'),
		pRoot = ctx.opts.projectRoot,
		
		wwwFolder = path.resolve(pRoot, "www/"),
		moveAllTo = path.resolve(wwwFolder, "platform_cordova_files/")
	
	const sys = {
		getPlatformDir(platform, cordovaFile) {
			
			if( platform === 'android')
				return path.resolve(__dirname, `../platforms/${platform}/platform_www/${cordovaFile ? "cordova.js" : ""}`)
			else
				return path.resolve(__dirname, `../platforms/${platform}/www/${cordovaFile ? "cordova.js" : ""}`)
		},
		
		copyRecursiveSync(src, dest) {
			let exists = fs.existsSync(src),
				stats = exists && fs.statSync(src),
				isDirectory = exists && stats.isDirectory()
			
			if (exists && isDirectory) {
				
				if(!fs.existsSync(dest))
					fs.mkdirSync(dest)
				
				fs.readdirSync(src).forEach((childItemName) => {
					sys.copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
				})
			} else
				fs.linkSync(src, dest)
		},
		
		checkAndCopy(platforms) {
			platforms.forEach((platform) => {
				if (fs.existsSync(sys.getPlatformDir(platform)) && fs.existsSync(sys.getPlatformDir(platform, true))) {
					let movePath = path.resolve(moveAllTo, platform + '/')
					
					if (!fs.existsSync(movePath))
						fs.mkdirSync(movePath)
					
					sys.copyRecursiveSync(sys.getPlatformDir(platform), movePath)
				}
			})
		},
		
		copyMainXml() {
			fs.createReadStream(path.resolve(__dirname, "../config.xml")).pipe(fs.createWriteStream(path.resolve(wwwFolder, "config.xml")))
		},
		
		checkOption(name) {
			return (
				typeof ctx.opts !== "undefined" &&
				typeof ctx.opts.options !== "undefined" &&
				typeof ctx.opts.options[name] !== "undefined" &&
				ctx.opts.options[name] === true
			)
		},
		
		checkArgv(name) {
			return (
				typeof ctx.opts !== "undefined" &&
				typeof ctx.opts.options !== "undefined" &&
				typeof ctx.opts.options.argv !== "undefined" &&
				(
					Array.isArray(ctx.opts.options.argv) &&
					ctx.opts.options.argv.indexOf(name) > -1 ||
					ctx.opts.options.argv[name] === true
				)
			)
		},
		
		isFoundInCmdline( cmdCommand ) {
			return (
				ctx.cmdLine.indexOf(`cordova ${cmdCommand}`) > -1 ||
				ctx.cmdLine.indexOf(`phonegap ${cmdCommand}`) > -1
			)
		}
	}
	
	let deferral = new Q.defer(),
		isRun = sys.isFoundInCmdline('run'),
		isEmulate = sys.isFoundInCmdline('emulate'),
		isPrepare = sys.isFoundInCmdline('prepare'),
		isServe = sys.isFoundInCmdline('serve'),
		isLiveReload = sys.checkArgv('--live-reload') || sys.checkArgv('--lr') || sys.checkArgv('lr') || sys.checkArgv('live-reload')
	
	if (ctx.opts.platforms.length === 0 && !isPrepare) {
		console.log("Update happened. Skipping...")
		deferral.resolve()
	}
	else {
		if (isServe || (isRun || isEmulate) && isLiveReload) {
			console.log("Copying platform cordova files...")
			
			if (!fs.existsSync(moveAllTo))
				fs.mkdirSync(moveAllTo)
			
			sys.checkAndCopy(['android', 'ios', 'browser'])
			sys.copyMainXml()
			
			console.log("All platform files copied to www/platform_cordova_files/ directory!")
		} else
			console.log("Dev server not running. Skipping...")
		
		deferral.resolve()
	}
	
	return deferral.promise
}
