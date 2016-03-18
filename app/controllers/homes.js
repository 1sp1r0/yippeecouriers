// Request
var request = require('request');

// async
var async = require('async');

// Cheerio Scraper
var cheerio = require('cheerio');

// mongoose
var mongoose = require('mongoose');

// validate
var validate = require("validate.js");

// yippee utils
var yippeeUtils = require('../helpers/utils');
var yippeeConstants = require('../helpers/constants');

// Date Format
var dateFormat = require('dateformat');

// Models
var Trip = require('../models/trip');
var Pet = require('../models/pet');
var Estimate = require('../models/estimate');

//config
var slackToken = 'xoxp-23332966421-23343337041-23368666917-2414cef4be';

// get | show app
exports.index = function (req, res){
    res.render('index',{
        title: 'Yippee Air Courier'
    });
}

// get | show scrapbook
exports.scrapbook = function (req, res){
    var tripId = req.params.trip_id
    var conditions = {'_id' : tripId}
    Trip
    .findOne(conditions)
    .populate('_pets')
    .exec(function(error, trip){
        if(trip){
            request('https://slack.com/api/channels.history?token=' + slackToken + '&channel=C0PDBF475&pretty=1', function(error, response, body){
                var originalMessages = JSON.parse(body).messages;
                var processedMessages = [];

                var messageParser = function(message, callback){
                    if(message.file){
                        var file = message.file;
                        var processFile = function(){
                            request(file.permalink_public, function(error, response, body){
                                var $ = cheerio.load(body);
                                var imageUrl = $('.image_body').attr("href");
                                processedMessages.push({'file' : imageUrl, 'title' : file.title, 'date' : dateFormat(Date(file.timestamp), "dddd, mmmm dS, yyyy"), 'time' : dateFormat(Date(file.timestamp), "h:MM:ss TT")});
                                callback();
                            });
                        }
                        if(message.file.public_url_shared){
                            request('https://slack.com/api/files.info?token=' + slackToken + '&file=' + file.id + '&pretty=1', function(error, response, body){
                                processFile();
                            });
                        }else{
                            request('https://slack.com/api/files.sharedPublicURL?token=' + slackToken + '&file=' + file.id + '&pretty=1', function(error, response, body){
                                processFile();
                            });
                        }
                    }else{
                        if(!message.text.includes('<@U')){
                            processedMessages.push({'text' : message.text, 'date' : dateFormat(Date(message.ts), "dddd, mmmm dS, yyyy"), 'time' : dateFormat(Date(message.ts), "h:MM:ss TT")});
                        }
                        callback();
                    }
                }

                var messageErrorCallback = function(err){
                    if(err){
                        console.log("error: ", err);
                    }

                    res.render('scrapbook',{
                        title: 'Yippee Scrapbook',
                        trip_name: trip.trip_name,
                        trip: trip,
                        date_formatted: dateFormat(trip.trip_date, "dddd, mmmm dS, yyyy"),
                        messages: processedMessages.reverse()
                    });
                }

                async.eachSeries(originalMessages, messageParser, messageErrorCallback);
            });
        }else if(error){
            console.log("error: " + error.stack);
        }
    });
}

exports.scrapbooktemp = function (req,res){
    res.render('scrapbook-temp', {
        title: 'Sample Scrapbook'
    });
}

// post | fake create estimate
// exports.createEstimate = function(req, res){
//     console.log('fake createEstimate');
//     res.json({
//         'estimate_range': '$100-200',
//         'flight_cost': '$10',
//         'pet_fee': '$20',
//         'hotel_cost': '$30',
//         'yipee_fee': '$40',
//         'other_fee': '$50'
//     });
// }

// post | create an estimate
exports.createEstimate = function (req, res){
    var estimate = new Estimate({
        id:'123',
        trip_name: "Fly Fluffy! Fly!",
        trip_date: dateFormat('2016-12-16', "dddd, mmmm dS, yyyy"),
        flight: {
            cost_range: {
                low: 209,
                high: 498
            },
            orig_url: 'www',
            miles: 1,
            orig_name: 'Palo Alto, CA',
            orig_coordinates: {
                lat:  -122.387996,
                lng: 37.61594
            },
            orig_air_code: 'SFO',
            orig_carrier: 'g',
            orig_air_coordinates:{
                lat:  -122.387996,
                lng: 37.61594
            },
            dest_url: 'www',
            dest_carrier: 'x',
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
            id: 1,
            url: 'www',
            name: 'test',
            cost_range: {
                low: 78,
                high: 245
            },
             hotel_coordinates:{
                lat:  -122.387996,
                lng: 37.61594
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
       console.log(url);
        request.get(options, function (error, response, body) {
          // console.log(body);
          callback(null, body);

        });
    }



    function process_data_city(url_data, callback){
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 

            destCityData = results[0];
            if(destCityData){
                destCityCord = destCityData["results"][0]["geometry"]["location"];
                destCity = destCityData["results"][0]["formatted_address"];
            }

            //Insert Model
            estimate['flight']['orig_name'] = destCity;
            estimate['flight']['orig_coordinates'] = destCityCord;
           
            arrvlCityData = results[1];
            arrvlCityCord = arrvlCityData["results"][0]["geometry"]["location"];
            arrvlCity = arrvlCityData["results"][0]["formatted_address"];

            //Insert Model
            estimate['flight']['dest_name'] = arrvlCity;
            estimate['flight']['dest_coordinates'] = arrvlCityCord;

            console.log("Return ERR on with City: "+err);
            callback(null, destCityCord, arrvlCityCord);
            //callback(null, results[0]["results"][0]["formatted_address"], results[1]["results"][0]["formatted_address"]);
        });
   

    }

    function process_data_airport(url_data, callback){
        // console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 
            destAirportData = results[0][0];
            // console.log(destAirportData);

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
            
            console.log("Return ERR on with Airport: "+err);
            callback(null, destAirport, arrvlAirport, arrvlCityCord);
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

            if(destFlightData["legs"]){
                destFlight_legId = destFlightData["legs"][0]["legId"];
            }
            if(destFlightData["offers"]){
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
             if(estimate){
                estimate['flight']['orig_name'] = destCity;
                estimate['flight']['orig_url'] = destFlight_detailsUrl;
                estimate['flight']['orig_id'] = destFlight_legId;
             }

           
            // estimate['flight']['orig_name'] = destFlight_carrier;
        

        

            var arrvlFlightData = {};
            arrvlFlightData = results[1];
            // var arrvlLength = Object.keys(arrvlFlightData["offers"]).length;

            var arrvlFlight_detailsUrl = '';
            var arrvlFlight_legId = '';
            var arrvlFlight_totalFare = '';
            
            if(arrvlFlightData["offers"]){
                arrvlFlight_detailsUrl = arrvlFlightData["offers"][0]["detailsUrl"];
                arrvlFlight_totalFare = arrvlFlightData["offers"][0]["totalFare"];
            }
            if(arrvlFlightData["legs"]){
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
            if(estimate){
                estimate['flight']['dest_name'] = arrvlCity;
                estimate['flight']['dest_url'] = arrvlFlight_detailsUrl;
                estimate['flight']['dest_id'] = arrvlFlight_legId;
            }

            // estimate['flight']['dest_name'] = arrvlFlight_carrier;

            if(estimate){
                estimate['flight']['cost_range']['low'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);
                estimate['flight']['cost_range']['high'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);
                // estimate['flight']['miles'] = parseInt(destFlight_miles) + parseInt(arrvlFlight_miles);
            }

            var hotel_id;

            if(results[2]["HotelInfoList"]){
                console.log(results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"]);
                hotel_id = results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"];
            }
            
            if(hotel_id){
                estimate['hotel']['id'] = hotel_id;
            }

            var hotelCord;
            var hotelCost;
            var hotelURL;
            var hotelName;
            var hotelLocation;

            // results is now an array of stats for each file 
            if(results[2]["HotelInfoList"]){
                hotelCord = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["GeoLocation"];
                hotelCost = results[2]["HotelInfoList"]["HotelInfo"][9]["Price"]["TotalRate"]["Value"];
                hotelURL = results[2]["HotelInfoList"]["HotelInfo"][9]["DetailsUrl"];
                hotelName = results[2]["HotelInfoList"]["HotelInfo"][9]["Name"];

                hotelLocation = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["City"] + ", " + results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["Province"];
            }

            var estimate;

            if(hotelCord){
                estimate['hotel']['hotel_coordinates']  = {
                    lat: hotelCord['Latitude'], 
                    lng: hotelCord['Longitude']
                };
            }

            if(hotelCost){
                estimate['hotel']['cost_range']['low'] = hotelCost;
                estimate['hotel']['cost_range']['high'] = hotelCost;
            }

            if(hotelName){
                estimate['hotel']['name'] = hotelName;
            }

            if(hotelURL){
                estimate['hotel']['url'] = hotelURL;
            }

            if(hotelLocation){
                estimate['hotel']['location'] = hotelLocation;
            }

            var totalcost;

            if(hotelCost){
                totalcost = parseInt(hotelCost) + parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare) + 300;
                estimate['total_fee']['low'] = totalcost;
                estimate['total_fee']['high'] = totalcost;

                console.log("IT only costs: "+totalcost);


                console.log(results[2]["HotelInfoList"]["HotelInfo"][9]);
            }


            // console.log(arrvlFlight_totalFare);
            // console.log(arrvlFlight_detailsUrl);
            
            console.log("Return ERR on with Airport: "+err);
            if(hotel_id){
                callback(null, hotel_id, arrvlCityCord);
            }else{
                callback(null, null, null);
            }
        });

    }

    var startDate = req.body.trip_date;
    var dropoff_postcode = req.body.dropoff_postcode;
    var pickup_postcode = req.body.pickup_postcode;

    async.waterfall([
        function(callback) {
            //Zipcode to City / State / Zip
            var url_data = ['http://maps.googleapis.com/maps/api/geocode/json?address='+pickup_postcode+'&sensor=true', 'http://maps.googleapis.com/maps/api/geocode/json?address='+dropoff_postcode+'&sensor=true'];

            process_data_city(url_data, callback);
           
        },
        function(destCityCord, arrvlCityCord, callback) {
          // Find closest Airport
            var url_data1 = "http://terminal2.expedia.com/x/geo/features?lat="+destCityCord["lat"]+"&lng="+destCityCord["lng"]+"&type=airport&verbose=3&limit=10&apikey="+apiKey;
            var url_data2 = "http://terminal2.expedia.com/x/geo/features?lat="+arrvlCityCord["lat"]+"&lng="+arrvlCityCord["lng"]+"&type=airport&verbose=3&limit=10&apikey="+apiKey;
            var url_data = [url_data1, url_data2];
            process_data_airport(url_data, callback);

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

        res.json({
        'estimate_range': " $"+estimate['total_fee']['high'],
        'flight_cost': " $"+estimate['flight']['cost_range']['high'],
        'pet_fee': '$100',
        'hotel_cost': " $"+Math.round(estimate['hotel']['cost_range']['high']),

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



// post | create a trip
exports.createTrip = function (req, res){
    // now we save the trip
    var trip = new Trip({
        trip_name: req.body.sender_name + ' to ' + req.body.receiver_name + ' (' + req.body.pet_name + ')',
        status: yippeeConstants.TRIP_STATUS_REQUESTED,
        main_contact: req.body.main_contact,
        sender_name: req.body.sender_name,
        sender_email: req.body.sender_email,
        sender_phone: req.body.sender_phone,
        receiver_name: req.body.receiver_name,
        receiver_email: req.body.receiver_email,
        receiver_phone: req.body.receiver_phone,
        trip_date: req.body.trip_date,
        origin_airport_code: req.body.origin_airport_code,
        destination_airport_code: req.body.destination_airport_code,
        pickup_address: {
            address1: req.body.pickup_address1,
            address2: req.body.pickup_address2,
            city: req.body.pickup_city,
            state: req.body.pickup_state,
            postcode: req.body.pickup_postcode
        },
        dropoff_address: {
            address1: req.body.dropoff_address1,
            address2: req.body.dropoff_address2,
            city: req.body.dropoff_city,
            state: req.body.dropoff_state,
            postcode: req.body.dropoff_postcode
        },
        trip_notes: req.body.trip_notes,
        _pets: null,                                // assign the pet ids later, after saving the pets
        _estimate_id: req.body.estimateId          // assign the estimate ID that was passed
    });

    trip.save(function (error, savedTrip){
        if (error) {
            console.log("Error Saving Trip: " + error);
            res.json(yippeeUtils.createJsonResponse(error));
            return;            
        } else {

            // now, save the pet
            var pet = new Pet({
                name: req.body.pet_name,
                species: req.body.pet_species,
                age: req.body.pet_age,
                weight: req.body.pet_weight,
                has_carrier: req.body.pet_has_carrier,
                medical_notes: req.body.pet_medical_notes,
                pet_notes: req.body.pet_notes,
            });

            pet.save(function (error, savedPet){
                if (error) {
                    console.log("Error Saving Pet: " + error);
                    res.json(yippeeUtils.createJsonResponse(error));
                    return;
                } else {

                    // attach the petId to the trip. At some point we'll need to be able to
                    // save multiple pets, but we'll forgo that for now.
                    savedTrip._pets = [savedPet._id];

                    savedTrip.save(function (error, savedTrip){
                        if (error) {
                            console.log("Error Saving Trip: " + error);
                            res.json(yippeeUtils.createJsonResponse(error));
                            return;            
                        }
                    });

                    // All systems go! Now talk to slack, and then send an API response
                    var slackMessage = `*${savedTrip.trip_name}*`;

                    var pickupAddress = `${savedTrip.pickup_address.address1} ${savedTrip.pickup_address.address2}, ${savedTrip.pickup_address.city}, ${savedTrip.pickup_address.state} ${savedTrip.pickup_address.postcode} `;
                    var dropoffAddress = `${savedTrip.dropoff_address.address1} ${savedTrip.dropoff_address.address2}, ${savedTrip.dropoff_address.city}, ${savedTrip.dropoff_address.state} ${savedTrip.dropoff_address.postcode} `;

                    var slackAttachments = [{'title': 'Sender', 
                                             'text': `${savedTrip.sender_name}\n${savedTrip.sender_phone}\n${savedTrip.sender_email}`},
                                            {'title': 'Receiver', 
                                             'text': `${savedTrip.receiver_name}\n${savedTrip.receiver_phone}\n${savedTrip.receiver_email}`},
                                            {'title': 'Pet Details', 
                                             'text': `Name: ${savedPet.name}\nSpecies: ${savedPet.species}\nAge: ${savedPet.age}\nWeight: ${savedPet.weight}\nHas Carrier: ${savedPet.has_carrier}\nMedical Notes: ${savedPet.medical_notes}\nPet Notes: ${savedPet.pet_notes}`},
                                             {'title': 'Trip Details', 
                                             'text': `Requested Trip Date: ${savedTrip.trip_date}\nOrigin Airport: ${savedTrip.origin_airport_code}\nDestination Airport: ${savedTrip.destination_airport_code}\nPickup Address: ${pickupAddress}\nDropoff Address: ${dropoffAddress}`},
                                            ];

                    var slackJson = {json:{"text":slackMessage, "attachments": slackAttachments}};

                    request.post('https://hooks.slack.com/services/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', slackJson );

                    res.json(yippeeUtils.createJsonResponse(error, savedTrip));
                }
            });
        }
    });
}