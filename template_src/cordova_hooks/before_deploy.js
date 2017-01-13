module.exports = function(context) {
	const Q = context.requireCordovaModule('q'),
				cheerio = context.requireCordovaModule('cheerio')
	
	let deferral = new Q.defer();
	
	console.log("Before deploy hook started...")
	
	console.log(context)
	
	setTimeout(() => {
		deferral.resolve(null)
	}, 6000)
	
	return deferral.promise
}

// index.html'de cordova.js yoksa, otomatik ekle