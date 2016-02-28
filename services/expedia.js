// Request
var request = require('request');

var req = {'address': "246 Clinton Park, San Francisco, CA 94103"};

function initialize(){
	geocoder = new google.maps.Geocoder();

}

// Get lat/lon from address
exports.getLatLon = function (req, res){
	var address = req.address;
	geocoder.geocode( {'address': address}, function(results, status){ 
		console.log(results[0]);
	});
	
	//https://maps.googleapis.com/maps/api/geocode/output?json
};

var getLatLon2 = function(address){
	request('https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAzEwdoESbwhoRUB0I8Xa3QlwQnHsKRs3U', function(error, response, body){
		console.log('body', body);
		// var lat = response.lat;
		// var long = response.log;
		// var latLong = {
		// 	'lat': lat,
		// 	'long': long
		// };
		// return latLong;
	})
};

getLatLon2();