// HTTP
var http = require('http');

// ASYNC
var async = require('async');

// REQUESTS
var request = require('request');

// mongoose
var mongoose = require('mongoose');

var Estimate = require('../models/estimate');


exports.createEstimate = function (req, res){

    var estimate = new Estimate({
        trip_name: "Fly Fluffy! Fly!",
        trip_date: '2016-12-16',
        flight: {
            cost_range: {
                low: 209,
                high: 498
            },
            orig_name: 'Palo Alto, CA',
            orig_coordinates: {
                lat:  -122.387996,
                lng: 37.61594
            },
            orig_air_code: 'SFO',
            orig_air_coordinates:{
                lat:  -122.387996,
                lng: 37.61594
            },
            dest_name: 'Palo Alto, CA',
            dest_coordinates: {
                lat: -73.7789,
                lng: 37.61594
            },
            dest_air_code: 'SFO',
            dest_air_coordinates:{
                lat:  -122.387996,
                lng: 37.61594
            },
        },
        hotel: {
            cost_range: {
                low: 78,
                high: 245
            },
        },
        airline_pet_fee: 100,
        yippee_fee: 200,
        misc_fee: 0,
        total_fee: {
            low: 587,
            high: 1043
        },
    });

    var apiKey = "lcUYhjUA083IM9r8Ep7RA8QybLu2MMBS";

    function send_data_get(url, callback){
       options = {url, json: true};
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
            destCityCord = destCityData["results"][0]["geometry"]["location"];
            destCity = destCityData["results"][0]["formatted_address"];

            //Insert Model
            estimate['orig_name'] = destCity;
            estimate['orig_coordinates'] = destCityCord;
           
            arrvlCityData = results[1];
            arrvlCityCord = arrvlCityData["results"][0]["geometry"]["location"];
            arrvlCity = arrvlCityData["results"][0]["formatted_address"];

            //Insert Model
            estimate['dest_name'] = arrvlCity;
            estimate['dest_coordinates'] = arrvlCityCord;

            console.log("Return ERR on with City: "+err);
            callback(null, destCityCord, arrvlCityCord);
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
            destAirportCord = destAirportData["position"]["coordinates"];

            //Insert Model
            estimate['orig_air_code'] = destCity;
            estimate['orig_coordinates'] = {
                lat: destAirportCord[0], 
                lng: destAirportCord[1]
            };

             arrvlAirportData = results[1][0];

             arrvlAirport = arrvlAirportData["tags"]["iata"]["airportCode"]["value"];
             arrvlAirportCord = arrvlAirportData["position"]["coordinates"];
             // arrvlAirportCode = arrvlAirportData[''];
             // console.log(arrvlAirport);

            estimate['dest_air_code'] = arrvlCity;
            estimate['dest_coordinates'] = {
                lat: arrvlCityCord[0], 
                lng: arrvlCityCord[1]
            };
            
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

             //Insert Model
            estimate['orig_name'] = destCity;
            estimate['orig_coordinates'] = destCityCord;

             // destAirportCode = destAirportData["tags"]["iata"]["airportCode"]["value"];
            console.log(destFlight_totalFare);
            console.log(destFlight_detailsUrl);

            var arrvlFlightData = results[1];
            var arrvlLength = Object.keys(arrvlFlightData["offers"]).length;

            arrvlFlight_legId = arrvlFlightData["legs"][0]["legId"];
            arrvlFlight_totalFare = arrvlFlightData["offers"][0]["totalFare"];
            arrvlFlight_detailsUrl = arrvlFlightData["offers"][0]["detailsUrl"];

            //Insert Model
            estimate['dest_name'] = arrvlCity;


            estimate['flight']['cost_range']['low'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);
            estimate['flight']['cost_range']['high'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);


            console.log(arrvlFlight_totalFare);
            console.log(arrvlFlight_detailsUrl);
            
            console.log("Return ERR on with Airport: "+err);
            callback(null, destFlight_totalFare, arrvlFlight_totalFare);
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
    console.log(estimate);
    estimate.save(function(error, savedEstimate) {
        if(savedEstimate){
            console.log(savedEstimate);
        }else if(error){
            console.log("error: " + error);
        }
    });
});

    

    res.render('index',{
        title: 'Yippee Air Courier'
    });
}



