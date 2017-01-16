console.log("Copying platform cordova files...")

const fs = require('fs'),
	path = require('path'),
	moveAllTo = path.resolve(__dirname, "../www/platform_cordova_files/")

function getPlatformDir(platform, cordovaFile) {
	
	if( platform == 'android')
		return path.resolve(__dirname, `../platforms/${platform}/assets/www/${cordovaFile ? "cordova.js" : ""}`)
	else
		return path.resolve(__dirname, `../platforms/${platform}/www/${cordovaFile ? "cordova.js" : ""}`)
}

function copyRecursiveSync(src, dest) {
	let exists = fs.existsSync(src),
		stats = exists && fs.statSync(src),
		isDirectory = exists && stats.isDirectory()
	
	if (exists && isDirectory) {
		
		if(!fs.existsSync(dest))
			fs.mkdirSync(dest)
		
		fs.readdirSync(src).forEach((childItemName) => {
			copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
		})
	} else
		fs.linkSync(src, dest)
}

function checkAndCopy(platforms) {
	platforms.forEach((platform) => {
		if (fs.existsSync(getPlatformDir(platform)) && fs.existsSync(getPlatformDir(platform, true))) {
			let movePath = path.resolve(moveAllTo, platform + '/')
			
			if (!fs.existsSync(movePath))
				fs.mkdirSync(movePath)
			
			copyRecursiveSync(getPlatformDir(platform), movePath)
		}
	})
}

function copyMainXml() {
	fs.createReadStream(path.resolve(__dirname, "../config.xml")).pipe(fs.createWriteStream(path.resolve(__dirname, "../www/config.xml")))
}

if (!fs.existsSync(moveAllTo))
	fs.mkdirSync(moveAllTo)

checkAndCopy(['android', 'ios', 'browser'])
copyMainXml()

console.log("All platform files copied to www/platform_cordova_files/ directory!")
