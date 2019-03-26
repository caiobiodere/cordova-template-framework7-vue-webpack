module.exports = function (ctx) {
	const Q = require('q'),
		path = require('path'),
		fs = require('fs'),
		cp = require('child_process'),
		os = require('os'),
		ifaces = os.networkInterfaces(),
		spawn = cp.spawn,
		exec = cp.exec,
		pRoot = ctx.opts.projectRoot,

		nodeModulesPath = path.resolve(pRoot, 'node_modules/'),
		wwwFolder = path.resolve(pRoot, 'www/'),
		staticFolder = path.resolve(pRoot, 'src/static/'),
		targetStaticFolder = path.resolve(wwwFolder, 'static/'),
		manifestFileSrcPath = path.resolve(pRoot, 'src/manifest.json'),
		manifestFileCopyPath = path.resolve(wwwFolder, 'manifest.json'),
		webpackPath = path.resolve(nodeModulesPath, '.bin/webpack'),
		epipeBombPath = path.resolve(nodeModulesPath, '.bin/epipebomb'),
		webpackDevServerPath = path.resolve(nodeModulesPath, '.bin/webpack-dev-server'),
		packageJsonPath = path.resolve(__dirname, '../package.json'),

		packageJson = require(packageJsonPath)

	function getRouterIpAddr () {
		for (let key in ifaces) {
			if (ifaces.hasOwnProperty(key)) {
				for (let ipInfoKey in ifaces[key]) {
					if (ifaces[key].hasOwnProperty(ipInfoKey)) {
						let ipInfo = ifaces[key][ipInfoKey]

						if (ipInfo.family === 'IPv4' && !ipInfo.internal)
							return ipInfo.address
					}
				}
			}
		}

		return '127.0.0.1'
	}


	const sys = {

		toKebabCase (txt) {
			return txt.replace(/(\s)+/g, '-').replace(/[A-Z]/g, function (t) {
				return t.toLowerCase()
			})
		},

		checkPackageName () {
			if (typeof packageJson.name === 'undefined' || packageJson.name === '') {
				packageJson.name = 'hello-world'
			} else if (/\s/g.test(packageJson.name)) {
				packageJson.name = sys.toKebabCase(packageJson.name)
				fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson), 'utf-8')
			}
		},

		deleteFolderRecursive (path, doNotDeleteSelf = false) {
			if (fs.existsSync(path)) {
				fs.readdirSync(path).forEach((file) => {
					let curPath = path + '/' + file
					if (fs.lstatSync(curPath).isDirectory())
						sys.deleteFolderRecursive(curPath);
					else
						fs.unlinkSync(curPath)
				})

				if (!doNotDeleteSelf)
					fs.rmdirSync(path)
			}
		},

		cleanWww () {
			let wwwDir = path.resolve(__dirname, '../www/')
			sys.deleteFolderRecursive(wwwDir, true)
		},

		checkManifestFile () {
			if (fs.existsSync(manifestFileSrcPath)) {
				console.log('Manifest.json found in src folder. Copying...')
				fs.writeFileSync(manifestFileCopyPath, fs.readFileSync(manifestFileSrcPath))
			}
		},

		checkNodeModules () {
			let defer = new Q.defer()

			console.log('Checking is node modules installed...')

			if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(path.resolve(nodeModulesPath, 'cheerio/'))) {
				console.log('Node modules not found. Installing...')

				exec('npm i', { cwd: pRoot, maxBuffer: 1024 * 1024 * 5 }, (error) => {
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

		makeNonDevServerChanges () {
			let defer = new Q.defer(),
				cheerio = require('cheerio'),
				configFile = path.resolve(__dirname, '../config.xml'),
				conf = cheerio.load(fs.readFileSync(configFile), { xmlMode: true })

			if (conf('allow-navigation').length > 0) {
				let target = conf('allow-navigation')

				if (target.attr('data-href') !== '') {
					target.attr('href', target.attr('data-href'))
					target.removeAttr('data-href')
				}
			}

			fs.writeFileSync(configFile, conf.html(), 'utf-8')
			sys.cleanWww()

			defer.resolve()

			return defer.promise
		},

		makeDevServerChanges () {
			let defer = new Q.defer(),
				configFile = path.resolve(__dirname, '../config.xml'),
				srcFile = path.resolve(__dirname, '../webpack/dev_helpers/device_router.html'),
				targetFile = path.resolve(wwwFolder, 'index.html'),

				defaultCsp = `default-src *; script-src 'self' data: 'unsafe-inline' 'unsafe-eval' http://127.0.0.1:8081 http://LOCIP:8081; object-src 'self' data: http://127.0.0.1:8081 http://LOCIP:8081; style-src 'self' 'unsafe-inline' data: ; img-src *; media-src 'self' data: http://127.0.0.1:8081 http://LOCIP:8081; frame-src 'self' data: http://127.0.0.1:8081 http://LOCIP:8081; font-src *; connect-src 'self' data: http://127.0.0.1:8081 http://LOCIP:8081`,

				cheerio = require('cheerio'),
				$ = cheerio.load(fs.readFileSync(srcFile, 'utf-8')),
				conf = cheerio.load(fs.readFileSync(configFile), { xmlMode: true })

			sys.cleanWww()

			$('head').prepend(`<meta http-equiv="content-security-policy" content="${defaultCsp.replace(/LOCIP/g, getRouterIpAddr())}">`)
			$('body').prepend(`<script>const localServerIp = '${getRouterIpAddr()}'</script>`).append(`<script src="cordova.js"></script>`)
			fs.writeFileSync(targetFile, $.html())

			if (conf('allow-navigation').length === 0)
				conf('widget').append('<allow-navigation href="*" />')
			else {
				let target = conf('allow-navigation')

				if (target.attr('href') !== '*')
					target.attr('data-href', target.attr('href')).attr('href', '*')
			}

			fs.writeFileSync(configFile, conf.html(), 'utf-8')

			sys.deleteFolderRecursive(targetStaticFolder, true)
			sys.copyRecursiveSync(staticFolder, targetStaticFolder)
			sys.watchStaticFolder()

			defer.resolve()

			return defer.promise
		},

		startWebpackBuild (isRelease) {
			let defer = new Q.defer()

			console.log('Starting webpack build...')

			let wpPath = webpackPath + (os.platform() === 'win32' ? '.cmd' : '')

			exec(`"${wpPath}"` + (isRelease ? ' --env.release' : ''), { cwd: pRoot, maxBuffer: 1024 * 1024 * 5 }, (error, log) => {
				if (error) {
					console.error(`Error happened when webpack build: ${error}`);
					defer.reject(new Error(`Error happened when webpack build: ${error}`))
				}

				console.log(`Webpack log: ${log}`);

				sys.deleteFolderRecursive(targetStaticFolder, true)
				sys.copyRecursiveSync(staticFolder, targetStaticFolder)

				sys.checkManifestFile()

				console.log('Webpack build completed to www folder successfully!')
				defer.resolve()
			})

			return defer.promise
		},

		startWebpackDevServer (platform) {
			let defer = new Q.defer(),
				outText = '',
				isResultFound = false,
				args = [`"${webpackDevServerPath}"`, '--hot', '--inline', '--env.devserver', '--' + platform, `--public ${getRouterIpAddr()}:8081`, '--env.devserver'],
				run = epipeBombPath

			if (os.platform() === 'win32') {
				args = ['--hot', '--inline', '--env.devserver', '--' + platform, `--public ${getRouterIpAddr()}:8081`, '--env.devserver']
				run = `"${webpackDevServerPath}.cmd"`
			}

			let devServerSpawn = spawn(run, args, {
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

					if (outText.indexOf('bundle is now VALID.') > -1 || outText.indexOf('Compiled successfully.') > -1 || outText.indexOf('Compiled with warnings') > -1) {
						isResultFound = true
						outText = ''

						defer.resolve()
					}
				}
			})

			return defer.promise
		},

		emptyDefer () {
			let defer = new Q.defer()

			defer.resolve()

			return defer.promise
		},

		checkOption (name) {
			return (
				typeof ctx.opts !== 'undefined' &&
				typeof ctx.opts.options !== 'undefined' &&
				typeof ctx.opts.options[name] !== 'undefined' &&
				ctx.opts.options[name] === true
			)
		},

		checkArgv (name) {
			return (
				typeof ctx.opts !== 'undefined' &&
				typeof ctx.opts.options !== 'undefined' &&
				typeof ctx.opts.options.argv !== 'undefined' &&
				(
					Array.isArray(ctx.opts.options.argv) &&
					ctx.opts.options.argv.indexOf(name) > -1 ||
					ctx.opts.options.argv[name] === true
				)
			)
		},

		isFoundInCmdline (cmdCommand) {
			return (
				ctx.cmdLine.indexOf(`cordova ${cmdCommand}`) > -1 ||
				ctx.cmdLine.indexOf(`phonegap ${cmdCommand}`) > -1
			)
		},

		deleteFolderRecursive (path, doNotDeleteSelf = false) {
			if (fs.existsSync(path)) {
				fs.readdirSync(path).forEach((file) => {
					let curPath = path + '/' + file
					if (fs.lstatSync(curPath).isDirectory())
						sys.deleteFolderRecursive(curPath);
					else
						fs.unlinkSync(curPath)
				})

				if (!doNotDeleteSelf)
					fs.rmdirSync(path)
			}
		},

		copyRecursiveSync (src, dest) {
			let exists = fs.existsSync(src),
				stats = exists && fs.statSync(src),
				isDirectory = exists && stats.isDirectory()

			if (exists && isDirectory) {

				if (!fs.existsSync(dest))
					fs.mkdirSync(dest)

				fs.readdirSync(src).forEach((childItemName) => {
					sys.copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
				})
			} else
				fs.linkSync(src, dest)
		},

		createFile (p) {
			let rel = path.relative('./src/static/', p)
			sys.copyFile(p, path.resolve(targetStaticFolder, rel));
			console.log(`${p} created`)
		},

		addUpdate (p) {
			let rel = path.relative('./src/static/', p)
			console.log(`${p} copied to ${path.resolve(targetStaticFolder, rel)}`)
		},

		addDir (p) {
			let rel = path.relative('./src/static/', p)
			fs.mkdir(path.resolve(targetStaticFolder, rel), () => {
				console.log(`Found ${p} folder. Created to ${path.resolve(targetStaticFolder, rel)}`)
			})
		},

		delete (p) {
			let rel = path.relative('./src/static/', p)

			fs.access(path.resolve(targetStaticFolder, rel), fs.constants.W_OK, (err) => {
				if (!err) {
					fs.unlink(path.resolve(targetStaticFolder, rel), () => {
						console.log(`${path.resolve(targetStaticFolder, rel)} deleted.`)
					})
				} else {
					console.log(`${path.resolve(targetStaticFolder, rel)} not deleted.`)
				}
			})
		},

		copyFile (source, target, cb) {
			let cbCalled = false

			let rd = fs.createReadStream(source)
			rd.on("error", done)

			let wr = fs.createWriteStream(target)
			wr.on("error", done)
			wr.on("close", done)

			rd.pipe(wr)

			function done (err) {
				if (!cbCalled && typeof cb === 'function') {
					cb(err)
					cbCalled = true
				}
			}
		},

		watchStaticFolder () {

			if (fs.existsSync(staticFolder)) {

				const chokidar = require('chokidar'),
					watcher = chokidar.watch(staticFolder, {
						persistent: true
					})

				watcher.on('ready', () => {
					console.log('Watcher ready!')
					watcher
						.on('add', sys.createFile)
						.on('change', sys.addUpdate)
						.on('unlink', sys.delete)
						.on('addDir', sys.addDir)
						.on('unlinkDir', sys.delete)
				})
			}
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

	if (ctx.opts.platforms.length === 0 && !isPrepare) {
		console.log('Update happened. Skipping...')
		deferral.resolve()
	}
	else {
		console.log('Before deploy hook started...')

		// if package name contains space characters, we'll convert it to kebab case. Required for npm install command to work.
		sys.checkPackageName()

		sys.checkNodeModules()
			.then(() => {
				if (isBuild || ((isRun || isEmulate || isPrepare) && !isLiveReload && !isNoBuild)) {
					return sys.makeNonDevServerChanges().then(() => sys.startWebpackBuild(isRelease))
				} else if (isServe || (isRun || isEmulate) && isLiveReload) {
					return sys.makeDevServerChanges().then(() => sys.startWebpackDevServer(ctx.opts.platforms[0]))
				}
				else
					return sys.emptyDefer()
			})
			.then(() => {
				console.log('Cordova hook completed. Resuming to run your cordova command...')
				deferral.resolve()
			})
			.catch((err) => {
				console.log('Error happened on main chain:')
				console.log(err)

				deferral.reject(err)
			})
			.done()
	}

	return deferral.promise
}