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

     var controllerTry = 0;

    var estimate = new Estimate({
        id:'0',
        trip_name: "Fly",
        trip_date: "2016",
        flight: {
            cost_range: {
                low: 0,
                high: 0
            },
            orig_url: '',
            miles: 1,
            orig_name: '',
            orig_coordinates: {
                lat:  0,
                lng: 0
            },
            orig_air_code: '',
            orig_carrier: '',
            orig_air_coordinates:{
                lat: 0,
                lng: 0
            },
            dest_url: '',
            dest_carrier: '',
            dest_name: '',
            dest_coordinates: {
                lat: 0,
                lng: 0
            },
            dest_air_code: 'SFO',
            dest_air_coordinates:{
                lat: 0,
                lng: 0
            },
        },
        hotel: {
            id: 0,
            url: '',
            name: '',
            cost_range: {
                low: 0,
                high: 0
            },
             hotel_coordinates:{
                lat: 0,
                lng: 0
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


    var beartoken = "gAAAAABW040J2vjw2_YTRuFwkyhVWH1YYbxyMWFPqYIsRtFKromh3ZZvYrlzpWAgGbe_zf8nJ_gfcnmMdQIOSGMSoeVebT63yEbuRxLscUXhmBB7U0G2ZK7jGkmBQeQhGJ7KnEqV6R9eBNQ3408o2MY569MC8ocrIgXSBi7PRLhSZfoO__NZlzUd1r0siuVpsTycOes4ob4AuT9e08_gW7zoXpk0UH7yKg==";
    var apiKey = "lcUYhjUA083IM9r8Ep7RA8QybLu2MMBS";

    function send_data_get(url, callback){
       options = {url, json: true};
       
        request.get(options, function (error, response, body) {
          // console.log(body);

          if (!error && response.statusCode == 200) {
                callback(null, body);
            }else{
                console.log("Error: "+url);
                callback(new Error('Unable to connect!'));
                return;
            }
        });
    }

    function send_data_get_token(url, callback){

        var options = {
            url, 
            json: true,
            headers: {
                'Authorization': ' bearer '+beartoken
                }
        };
      
        request.get(options, function (error, response, body) {
          // console.log(body);

          if (!error && response.statusCode == 200) {
                callback(null, body);
            }else{
                console.log("Error: "+url);
                callback(new Error('Error: With request'));
                return;
            }
        });
    }

    function process_data_city(url_data, callback){
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 

            destCityData = results[0];

            var destCityCord = '';
            var arrvlCityCord = '';

            if(destCityData){
                destCityCord = destCityData["results"][0]["geometry"]["location"];
                destCity = destCityData["results"][0]["formatted_address"];
            

            //Insert Model
            estimate['flight']['orig_name'] = destCity;
            estimate['flight']['orig_coordinates'] = destCityCord;
           
            arrvlCityData = results[1];
            arrvlCityCord = arrvlCityData["results"][0]["geometry"]["location"];
            arrvlCity = arrvlCityData["results"][0]["formatted_address"];

            //Insert Model
            estimate['flight']['dest_name'] = arrvlCity;
            estimate['flight']['dest_coordinates'] = arrvlCityCord;

            }

            console.log("Return ERR on with City: "+err);
            callback(null, destCityCord, arrvlCityCord);
            //callback(null, results[0]["results"][0]["formatted_address"], results[1]["results"][0]["formatted_address"]);
        });
   

    }

    function process_lyft(url_data, callback){
         async.map(url_data, send_data_get_token, function(err, results){
            var destCityCord = '';
            var arrvlCityCord = '';
         callback(null, destCityCord, arrvlCityCord);
});
         
    }

    function process_data_airport(url_data, callback){
        // console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 

            // var keys = Object.keys( obj );

            // for( var i = 0,length = keys.length; i < length; i++ ) {
            //     if(typeof results[0][0]["tags"]["common"]hasOwnProperty("majorAirport");
            // }
            var lyft = '';
            var destAirport = '';
            var arrvlAirport = '';
            var arrvlCityCord = '';

            if(typeof results[0] !== 'undefined'){
        

            destAirportData = results[0][0];
            // console.log(destAirportData);
            // destAirportData["tags"]["common"] ["majorAirport"]


            
            destAirport = destAirportData["tags"]["iata"]["airportCode"]["value"];
            destAirportCord = destAirportData["position"]["coordinates"];

            //Insert Model
            estimate['flight']['orig_air_code'] = destAirport;
            estimate['flight']['orig_air_coordinates'] = {
                lat: destAirportCord[0], 
                lng: destAirportCord[1]
            };

            arrvlAirportData = results[1][0];

            arrvlAirport = arrvlAirportData["tags"]["iata"]["airportCode"]["value"];
            arrvlAirportCord = arrvlAirportData["position"]["coordinates"];
            // arrvlAirportCode = arrvlAirportData[''];
            // console.log("test "+arrvlAirportCord);



            estimate['flight']['dest_air_code'] = arrvlAirport;
            estimate['flight']['dest_air_coordinates'] = {
                lat: arrvlAirportCord[0], 
                lng: arrvlAirportCord[1]
            };

            lyft = destAirportCord;
            }
            
            console.log("Return ERR on with Airport: "+err);
            callback(null, destAirport, arrvlAirport, arrvlCityCord, lyft);
        });

    }

    function process_data_flights(url_data, callback){
        // console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 
            var destFlightData = results[0];
            // var destLength = Object.keys(destFlightData["offers"]).length;
            // console.log(destFlightData["legs"][0]["segments"]);

            var destFlight_legId = "";
            var destFlight_totalFare = "";
            var destFlight_detailsUrl = "";

            var hotel_id = "";
            var arrvlCityCord = "";
            var destCity = "";
            var arrvlCity = "";
            var arrvlCityCord = "";

                if(destFlightData){
                destFlight_legId = destFlightData["legs"][0]["legId"];
                destFlight_totalFare = destFlightData["offers"][0]["totalFare"];
                destFlight_detailsUrl = destFlightData["offers"][0]["detailsUrl"];
                }

            //  if(destFlightData["offers"][0]["segments"][0].hasOwnProperty("distance")){
            //     destFlight_carrier = destFlightData["legs"][0]["segments"]["airlineName"];
            //     destFlight_miles = destFlightData["legs"][0]["segments"]["distance"];
            // }else{
            //     destFlight_carrier = destFlightData["legs"][0]["segments"][0]["airlineName"];
            //     destFlight_miles = destFlightData["legs"][0]["segments"][0]["distance"]; 
            // }

             //Insert Model
            estimate['flight']['orig_name'] = destCity;
            estimate['flight']['orig_url'] = destFlight_detailsUrl;
            estimate['flight']['orig_id'] = destFlight_legId;
        

           
            // estimate['flight']['orig_name'] = destFlight_carrier;
        

        

            var arrvlFlightData = {};
            arrvlFlightData = results[1];
            // var arrvlLength = Object.keys(arrvlFlightData["offers"]).length;

            var arrvlFlight_detailsUrl = '';
            var arrvlFlight_legId = '';
            var arrvlFlight_totalFare = '';
            
            if(arrvlFlightData){
                arrvlFlight_detailsUrl = arrvlFlightData["offers"][0]["detailsUrl"];
                arrvlFlight_totalFare = arrvlFlightData["offers"][0]["totalFare"];
                arrvlFlight_legId = arrvlFlightData["legs"][0]["legId"];
            }
            
           

            // if(arrvlFlightData["offers"][0]["segments"].hasOwnProperty("distance")){
            //     arrvlFlight_miles = arrvlFlightData["offers"][0]["segments"]["distance"];
            //     arrvlFlight_carrier = arrvlFlightData["offers"][0]["segments"]["airlineName"];
            // }else{
            //     arrvlFlight_miles = arrvlFlightData["offers"][0]["segments"][0]["distance"];
            //     arrvlFlight_carrier = arrvlFlightData["offers"][0]["segments"][0]["airlineName"];
            // }

            //Insert Model
            estimate['flight']['dest_name'] = arrvlCity;
            estimate['flight']['dest_url'] = arrvlFlight_detailsUrl;
            estimate['flight']['dest_id'] = arrvlFlight_legId;
        
            // estimate['flight']['dest_name'] = arrvlFlight_carrier;


            estimate['flight']['cost_range']['low'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);
            estimate['flight']['cost_range']['high'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);
            // estimate['flight']['miles'] = parseInt(destFlight_miles) + parseInt(arrvlFlight_miles);
             if((destFlightData) && (arrvlFlightData)) {
            console.log(results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"]);
            hotel_id = results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"];
            
            estimate['hotel']['id'] = hotel_id;

            // results is now an array of stats for each file 
            hotelCord = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["GeoLocation"];
            hotelCost = results[2]["HotelInfoList"]["HotelInfo"][9]["Price"]["TotalRate"]["Value"];
            hotelURL = results[2]["HotelInfoList"]["HotelInfo"][9]["DetailsUrl"];
            hotelName = results[2]["HotelInfoList"]["HotelInfo"][9]["Name"];

            hotelLocation = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["City"] + ", " + results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["Province"];

            estimate['hotel']['hotel_coordinates']  = {
                lat: hotelCord['Latitude'], 
                lng: hotelCord['Longitude']
            };

            estimate['hotel']['cost_range']['low'] = hotelCost;
            estimate['hotel']['cost_range']['high'] = hotelCost;

            estimate['hotel']['name'] = hotelName;
            estimate['hotel']['url'] = hotelURL;
            estimate['hotel']['location'] = hotelLocation;

            totalcost = parseInt(hotelCost) + parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare) + parseInt(estimate['ride']['cost_to']) + parseInt(estimate['ride']['cost_from']) + 300;
            estimate['total_fee']['low'] = totalcost;
            estimate['total_fee']['high'] = totalcost;

            console.log("IT only costs: "+totalcost);


            console.log(results[2]["HotelInfoList"]["HotelInfo"][9]);


            // console.log(arrvlFlight_totalFare);
            // console.log(arrvlFlight_detailsUrl);
        }
            
            console.log("Return ERR on with Airport: "+err);
            // callback(null, hotel_id, hotel_id);
        });

    }

    var startDate = req.body.trip_date;
    var dropoff_postcode = req.body.dropoff_postcode;
    var pickup_postcode = req.body.pickup_postcode;
    var arrCord = [];
    var desCord = [];

    var lyftTo = 0;
   
    async.waterfall([
        function(callback) {
            //Zipcode to City / State / Zip
            var url_data = ['http://maps.googleapis.com/maps/api/geocode/json?address='+pickup_postcode+'&sensor=true', 'http://maps.googleapis.com/maps/api/geocode/json?address='+dropoff_postcode+'&sensor=true'];

            process_data_city(url_data, callback);
           
        },
        function(destCityCord, arrvlCityCord, callback) {
          // Find closest Airport
            arrCord = arrvlCityCord;
            desCord = destCityCord;
            var url_data1 = "http://terminal2.expedia.com/x/geo/features?lat="+destCityCord["lat"]+"&lng="+destCityCord["lng"]+"&type=airport&verbose=3&limit=10&apikey="+apiKey;
            var url_data2 = "http://terminal2.expedia.com/x/geo/features?lat="+arrvlCityCord["lat"]+"&lng="+arrvlCityCord["lng"]+"&type=airport&verbose=3&limit=10&apikey="+apiKey;
            var url_data = [url_data1, url_data2];
            process_data_airport(url_data, callback);

        },
        function(arrvlAirport, destAirport, arrvlCityCord, lyft, callback){

            var url_data1 = "https://api.lyft.com/v1/cost?start_lng="+arrCord["lng"]+"&start_lat="+arrCord["lat"]+"&end_lng="+arrvlCityCord["lng"]+"&end_lat="+arrvlCityCord["lat"];
            var url_data2 = "https://api.lyft.com/v1/cost?start_lng="+desCord["lng"]+"&start_lat="+desCord["lat"]+"&end_lng="+lyft[0]+"&end_lat="+lyft[1];
            var url_data = [url_data1, url_data2];
            process_lyft(url_data, callback);
            callback(null, arrvlAirport, destAirport, arrvlCityCord);

        },
        function(arrvlAirport, destAirport, arrvlCityCord, callback) {
            console.log(startDate);
            var d = new Date(startDate);
            console.log(d);

            var day = (d.getDate()+2).toString();
            day = day.length > 1 ? day : '0' + day;

            var month = (d.getMonth()+1).toString();
            month = month.length > 1 ? month : '0' + month;

            var dateReturn = d.getFullYear()+'-'+month+'-'+day;
            console.log("Return Date "+dateReturn);

            var dateFly = startDate;
            console.log("Fly Date "+dateFly);

            var url_data1 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateFly+"&departureAirport="+arrvlAirport+"&arrivalAirport="+destAirport+"&maxOfferCount=10&apikey="+apiKey;
            var url_data2 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateReturn+"&departureAirport="+destAirport+"&arrivalAirport="+arrvlAirport+"&maxOfferCount=10&apikey="+apiKey;
            var url_data3 = "http://terminal2.expedia.com:80/x/hotels?maxhotels=10&radius=10km&location="+arrvlCityCord["lat"]+"%2C"+arrvlCityCord["lng"]+"&sort=price&checkInDate="+dateFly+"&checkOutDate="+dateReturn+"&apikey="+apiKey;
            var url_data = [url_data1, url_data2, url_data3];
            process_data_flights(url_data, callback);


        }
        
    ], function (err, result) {
        // result now equals 'done'
        // console.log("LYFT: "+estimate['flight']['miles']);
        res.json({
        'estimate_range': " $"+estimate['total_fee']['high'],
        'flight_cost': " $"+estimate['flight']['cost_range']['high'],
        'pet_fee': '$100',
        'hotel_cost': " $"+Math.round(estimate['hotel']['cost_range']['high']),
        'lyft_fee': " $"+estimate['ride']['cost_to'],
        'lyft2_fee': " $"+estimate['ride']['cost_from'],
        'yipee_fee': '$200',
        'other_fee': '$25'
    });
        console.log(estimate);
        estimate.save(function(error, savedEstimate) {
            if(savedEstimate){
                console.log(savedEstimate);
            }else if(error){
                console.log("error: " + error);
            }

        
        });
    });

}
