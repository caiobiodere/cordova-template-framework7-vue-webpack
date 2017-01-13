/*
This script runs before this commands:
	cordova emulate
	cordova run
*/

module.exports = function(context) {
	const Q = context.requireCordovaModule('q')
	let deferral = new Q.defer();
	
	console.log("Before Deploy Started!")
	
	setTimeout(function(){
		console.log('Before Deploy Ended!');
		deferral.resolve();
	}, 3000);
	
	return deferral.promise;
}

// index.html'de cordova.js yoksa, otomatik ekle