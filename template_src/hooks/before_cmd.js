module.exports = function (context) {
	const Q = context.requireCordovaModule('q'),
		cheerio = context.requireCordovaModule('cheerio')
	
	
	cont = {
		"hook": "before_prepare",
		"opts": {
			"platforms": ["android", "browser"],
			"options": {"live-reload": true, "nobuild": true, "argv": []},
			"verbose": false,
			"silent": false,
			"browserify": false,
			"fetch": false,
			"nohooks": [],
			"projectRoot": "C:\\xampp\\htdocs\\cordova_test\\test",
			"cordova": {"platforms": ["android", "browser"], "plugins": ["cordova-plugin-whitelist"], "version": "6.4.0"},
			"save": false
		},
		"cmdLine": "C:\\Program Files\\nodejs\\node.exe C:\\Program Files\\nodejs\\node_modules\\cordova\\bin\\cordova run --live-reload --nobuild",
		"cordova": {"binname": "cordova", "raw": {}},
		"scriptLocation": "C:\\xampp\\htdocs\\cordova_test\\test\\hooks\\before_cmd.js"
	}
	
	
	let deferral = new Q.defer();
	
	console.log("Before deploy hook started...")
	
	console.log(context)
	
	setTimeout(() => {
		deferral.resolve(null)
	}, 6000)
	
	return deferral.promise
}

// index.html'de cordova.js yoksa, otomatik ekle