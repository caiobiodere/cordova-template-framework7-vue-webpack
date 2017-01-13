/*
This script runs before this command:
 cordova build
*/

module.exports = function(context) {
	const Q = context.requireCordovaModule('q')
	let deferral = new Q.defer();
	
	console.log("Before Build Started!")
	
	setTimeout(function(){
		console.log('Before Build Ended!');
		deferral.resolve();
	}, 3000);
	
	return deferral.promise;
}

// index.html'de cordova.js yoksa, otomatik ekle