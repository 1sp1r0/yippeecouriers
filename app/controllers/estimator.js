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
          // console.log(body);
          callback(null, body);

        });
    }

    function send_data_get_url(url, callback){
       options = {url};
       // console.log(url);
        request.get(options, function (error, response, body) {
          // console.log(body);
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
             destAirportData = results[0][0];
             // console.log(destAirportData);

             destAirport = destAirportData["tags"]["iata"]["airportCode"]["value"];
             // destAirportCode = destAirportData["tags"]["iata"]["airportCode"]["value"];
             console.log(destAirport);


             arrvlAirportData = results[1][0];

             arrvlAirport = arrvlAirportData["tags"]["iata"]["airportCode"]["value"];
             // arrvlAirportCode = arrvlAirportData[''];
             console.log(arrvlAirport);

            
            console.log("Return ERR on with Airport: "+err);
            callback(null, destAirport, arrvlAirport);
        });

    }

    function process_data_flights(url_data, callback){
        console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 
             var destFlightData = results[0];
             var destLength = Object.keys(destFlightData["offers"]).length;
             // console.log(destAirportData);

            destFlight_legId = destFlightData["legs"][0]["legId"];
            destFlight_totalFare = destFlightData["offers"][0]["totalFare"];
            destFlight_detailsUrl = destFlightData["offers"][0]["detailsUrl"];
             // destAirportCode = destAirportData["tags"]["iata"]["airportCode"]["value"];
            console.log(destFlight_totalFare);
            console.log(destFlight_detailsUrl);

            var arrvlFlightData = results[1];
            var arrvlLength = Object.keys(arrvlFlightData["offers"]).length;

            arrvlFlight_legId = arrvlFlightData["legs"][0]["legId"];
            arrvlFlight_totalFare = arrvlFlightData["offers"][0]["totalFare"];
            arrvlFlight_detailsUrl = arrvlFlightData["offers"][0]["detailsUrl"];
             // arrvlAirportCode = arrvlAirportData[''];
            console.log(destFlight_totalFare);
            console.log(destFlight_detailsUrl);
            
            console.log("Return ERR on with Airport: "+err);
            callback(null, destFlight_totalFare, destFlight_totalFare);
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
    function(destCity, arrvlCity, callback) {arrvlCity
      // Find closest Airport
        var url_data1 = "http://terminal2.expedia.com/x/geo/features?lat="+destCity["lat"]+"&lng="+destCity["lng"]+"&type=airport&verbose=3&limit=10&apikey="+apiKey;
        var url_data2 = "http://terminal2.expedia.com/x/geo/features?lat="+arrvlCity["lat"]+"&lng="+arrvlCity["lng"]+"&type=airport&verbose=3&limit=10&apikey="+apiKey;
        var url_data = [url_data1, url_data2];
        process_data_airport(url_data, callback);

    },
    function(arrvlAirport, destAirport, callback) {
        var dateReturn = "2016-05-05";
        var dateFly = "2016-05-04";
        var url_data1 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateFly+"&departureAirport="+arrvlAirport+"&arrivalAirport="+destAirport+"&maxOfferCount=10&apikey="+apiKey;
        var url_data2 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateReturn+"&departureAirport="+destAirport+"&arrivalAirport="+arrvlAirport+"&maxOfferCount=10&apikey="+apiKey;
        var url_data = [url_data1, url_data2];
        process_data_flights(url_data, callback);
    }
], function (err, result, result2) {
    // result now equals 'done'
    console.log("Finihs" + JSON.stringify(result) + ", "+ JSON.stringify(result2));
});

res.render('index',{
        title: 'Yippee Air Courier'
    });

}