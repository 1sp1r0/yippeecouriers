// HTTP
var http = require('http');

// ASYNC
var async = require('async');

// REQUESTS
var request = require('request');

// mongoose
var mongoose = require('mongoose');






exports.createEstimate = function (req, res){


//Close Airports
// To get airport using a city or location name use the Search Resolution API   Parse response to get element annotated as t:AIRPORT and get the mapping airport code from element 

// http://terminal2.expedia.com/x/suggestions/regions?query=Seattle&apikey={INSERT_KEY_HERE}

// To get airport based on latitude, longitude use our Geo API. 

// http://terminal2.expedia.com/x/geo/features?within=<x>km&lat=<latitude>&lng=<longitude>&type=airport&verbose=3&apikey={INSERT_KEY_HERE}
function request_send_get(url, callback){
console.log(url);
options = {url, json: true};

request.get(options, function (error, response, body) {
  console.log(JSON.parse(body));
  callback(null, body);

});

}



var postalCode = 94024;
//Price Estimate
console.log("Test");

async.waterfall([
    //function findCity(destZipcode, arrvlZipcode, callback){
      function(callback){
      //Find City
      var cities = ['http://maps.googleapis.com/maps/api/geocode/json?address=94024&sensor=true"', 'http://maps.googleapis.com/maps/api/geocode/json?address=&sensor=true'];

      

          urlDestCity = "http://maps.googleapis.com/maps/api/geocode/json?address=94024&sensor=true";
          request_send_get(urlDestCity)
            console.log("Data");
            callback(null, data);
          

          urlArrvlCity = "http://maps.googleapis.com/maps/api/geocode/json?address=&sensor=true";
          arrvlCityData = request_send_get(urlArrvlCity);
          callback(null, arrvlCityData);
       
     // result now equals 'done' 
     console.log("good");
     console.log(result);


      destCity = destCityData["result"]['address_components'][0]['long_name']+", "+destCityData['result']['address_components'][2]['short_name'];


      
      arrvlCity = arrvlCityData['result']['address_components'][0]['long_name']+", "+arrvlCityData['result']['address_components'][2]['short_name'];

      callback(null, destCity, arrvlCity);
    },
    function findAirport(destCity, arrvlCity, callback){

      urlDestAirport = "http://terminal2.expedia.com/x/suggestions/regions?query="+destCity+"&apikey="+apiKey;
      destAirportData = request_send_get(urlDestAirport);
     


      urlArrvlAirport = "http://terminal2.expedia.com/x/suggestions/regions?query="+arrvlCity+"&apikey="+apiKey;
      arrvlAirportData = request_send_get(urlArrvlAirport);
      


      callback(null, destAirport, arrvlAirport);
    },
    function findFlights(destAirport, arrvlAirport, callback){


      date = 1;
      dateReturn = date+1;
      //There
      urlFlight = "http://terminal2.expedia.com:80/x/flights/v3/search/1/"+arrvlAirport+"/"+destAirport+"/"+dateReturn+"?apikey="+apiKey;
      arrvlAirportData = request_send_get(urlArrvlAirport);
      arrvlAirport = arrvlAirportData['recommended']['trends']['median']
      //Return
      urlReturnFlight = "http://terminal2.expedia.com:80/x/flights/v3/search/1/"+destAirport+"/"+arrvlAirport+"/"+dateReturn+"?apikey="+apiKey;
      arrvlAirportData = request_send_get(urlArrvlAirport);
      arrvlAirport = arrvlAirportData['recommended']['trends']['median']

      callback(null, 'three');
    },
    function findHotel(arg1, callback){
        // arg1 now equals 'three'
        callback(null, 'done');
    },
    function calclatePrice(destCity, arrvlCity, callback){

      urlDestAirport = "http://terminal2.expedia.com/x/suggestions/regions?query="+destCity+"&apikey="+apiKey;
      destAirportData = request_send_get(urlDestAirport);

      urlArrvlAirport = "http://terminal2.expedia.com/x/suggestions/regions?query="+arrvlCity+"&apikey="+apiKey;
      arrvlAirportData = request_send_get(urlArrvlAirport);

      callback(null, destAirport, arrvlAirport);
    },
], function (err, result) {
   // result now equals 'done' 
   console.log("good");

});
}

,
    function(callback) {
        //Zipcode to City / State / Zip
        var url_data = ['http://maps.googleapis.com/maps/api/geocode/json?address=94024&sensor=true', 'http://maps.googleapis.com/maps/api/geocode/json?address=10001&sensor=true'];
        process_data_city(url_data, callback);
        //    curl --include -X GET -H 'Authorization: bearer <bearer_token>' \
        // 'https://api.lyft.com/v1/cost?start_lat=37.7772&start_lng=-122.4233&end_lat=37.7972&end_lng=-122.4533'
       
    }
//Hotel Estimate


