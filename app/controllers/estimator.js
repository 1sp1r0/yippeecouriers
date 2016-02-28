// HTTP
var http = require('http');

// ASYNC
var async = require('async');

// REQUESTS
var request = require('request');

// mongoose
var mongoose = require('mongoose');


exports.createEstimate = function (req, res){
var apiKey = "lcUYhjUA083IM9r8Ep7RA8QybLu2MMBS";

    function send_data_get(url, callback){
       options = {url, json: true};
       // console.log(url);
        request.get(options, function (error, response, body) {
          console.log(body);
          callback(null, body);

        });
    }

    function process_data_city(url_data, callback){
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 

            destCityData = results[0];
            destCity = destCityData["results"][0]["geometry"]["location"];
            // console.log(destCity);
            arrvlCityData = results[1];
            arrvlCity = arrvlCityData["results"][0]["geometry"]["location"];
            // console.log(arrvlCity);

            console.log("Return ERR on with City: "+err);
            callback(null, destCity, arrvlCity);
            //callback(null, results[0]["results"][0]["formatted_address"], results[1]["results"][0]["formatted_address"]);

        });


           

    }

    function process_data_airport(url_data, callback){
        console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 
             destAirportData = results[0];
             destAirport = destAirportData[''];
             destAirportCords = destAirportData[''];

             arrvlAirportData = results[1];
             arrvlAirport = arrvlAirportData[''];
             arrvlAirportCords = arrvlAirportData[''];
            
            console.log("Return ERR on with City: "+err);
            callback(null, destAirport, destAirport);
        });

    }

    function process_data_flights(url_data, callback){
        console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 

            
            console.log("Return on: "+url_data);
            callback(null, results[0], results[1]);
        });

    }

    function process_data(url_data, callback){
        console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 

            
            console.log("Return on: "+url_data);
            callback(null, results[0], results[1]);
        });

    }

async.waterfall([
    function(callback) {
        //Zipcode to City / State / Zip
        var url_data = ['http://maps.googleapis.com/maps/api/geocode/json?address=94024&sensor=true', 'http://maps.googleapis.com/maps/api/geocode/json?address=10001&sensor=true'];
        process_data_city(url_data, callback);
       
    },
    function(destCity, arrvlCity, callback) {
      // Find closest Airport
        var url_data1 = "http://terminal2.expedia.com:80/x/geo/features?within=100mi&lat="+destCity["lat"]+"&lng="+destCity["lng"]+"&type=airport&apikey="+apiKey;
        var url_data2 = "http://terminal2.expedia.com:80/x/geo/features?within=100mi&lat="+arrvlCity["lat"]+"&lng="+arrvlCity["lng"]+"&type=airport&apikey="+apiKey;
        var url_data = [url_data1, url_data2];
        process_data_airport(url_data, callback);

    },
    function(arg1, arg2, callback) {
        // arg1 now equals 'three'
        callback(null, arg2, arg1);
    }
], function (err, result, result2) {
    // result now equals 'done'
    console.log("Finihs" + JSON.stringify(result) + ", "+ JSON.stringify(result2));
});

res.render('index',{
        title: 'Yippee Air Courier'
    });

}