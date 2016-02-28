// Request
var request = require('request');

// async
var async = require('async');

// Cheerio Scraper
var cheerio = require('cheerio');

// mongoose
var mongoose = require('mongoose');

// yippee utils
var yippeeUtils = require('../helpers/utils');
var yippeeConstants = require('../helpers/constants');

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
            request('https://slack.com/api/channels.history?token=' + slackToken + '&channel=C0PAUA2AH&pretty=1', function(error, response, body){
                var originalMessages = JSON.parse(body).messages;
                var processedMessages = [];

                var messageParser = function(message, callback){
                    if(message.file){
                        var file = message.file;
                        var processFile = function(){
                            request(file.permalink_public, function(error, response, body){
                                var $ = cheerio.load(body);
                                var imageUrl = $('.image_body').attr("href");
                                processedMessages.push({'file' : imageUrl, 'title' : file.title, 'timestamp' : Date(file.timestamp)});
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
                        processedMessages.push({'text' : message.text, 'timestamp' : Date(message.ts)});
                        callback();
                    }
                }

                var messageErrorCallback = function(err){
                    if(err){
                        console.log("error: ", err);
                    }

                    console.log(trip);

                    res.render('scrapbook',{
                        title: 'Yippee Scrapbook',
                        trip_name: trip.trip_name,
                        trip: trip,
                        messages: processedMessages
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

// post | create an estimate
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
        console.log("Return on: "+url_data);
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
             console.log("test "+arrvlAirportCord);

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
        console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 
             var destFlightData = results[0];
             var destLength = Object.keys(destFlightData["offers"]).length;
             console.log(destLength);

            destFlight_legId = destFlightData["legs"][0]["legId"];
            destFlight_totalFare = destFlightData["offers"][0]["totalFare"];
            destFlight_detailsUrl = destFlightData["offers"][0]["detailsUrl"];

             //Insert Model
            estimate['flight']['orig_name'] = destCity;
            estimate['flight']['orig_url'] = destFlight_detailsUrl;
            estimate['flight']['orig_id'] = destFlight_legId;

             // destAirportCode = destAirportData["tags"]["iata"]["airportCode"]["value"];
            // console.log(destFlight_totalFare);
            // console.log(destFlight_detailsUrl);

            var arrvlFlightData = results[1];
            var arrvlLength = Object.keys(arrvlFlightData["offers"]).length;

            arrvlFlight_legId = arrvlFlightData["legs"][0]["legId"];
            arrvlFlight_totalFare = arrvlFlightData["offers"][0]["totalFare"];
            arrvlFlight_detailsUrl = arrvlFlightData["offers"][0]["detailsUrl"];

            //Insert Model
            estimate['flight']['dest_name'] = arrvlCity;
            estimate['flight']['dest_url'] = arrvlFlight_detailsUrl;
            estimate['flight']['dest_id'] = arrvlFlight_legId;


            estimate['flight']['cost_range']['low'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);
            estimate['flight']['cost_range']['high'] = parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare);

            console.log(results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"]);
            hotel_id = results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"];
            
            estimate['hotel']['id'] = hotel_id;

            // results is now an array of stats for each file 
            hotelCord = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["GeoLocation"];
            hotelCost = results[2]["HotelInfoList"]["HotelInfo"][9]["Price"]["TotalRate"]["Value"];
            hotelURL = results[2]["HotelInfoList"]["HotelInfo"][9]["DetailsUrl"];

            estimate['hotel']['hotel_coordinates']  = {
                lat: hotelCord['Latitude'], 
                lng: hotelCord['Longitude']
            };

            estimate['hotel']['cost_range']['low'] = hotelCost;
            estimate['hotel']['cost_range']['high'] = hotelCost;

            estimate['hotel']['url'] = hotelURL;

            totalcost = parseInt(hotelCost) + parseInt(destFlight_totalFare) + parseInt(arrvlFlight_totalFare) + 300;
            estimate['total_fee']['low'] = totalcost;
            estimate['total_fee']['high'] = totalcost;

            console.log("IT only costs: "+totalcost);


            console.log(results[2]["HotelInfoList"]["HotelInfo"][9]);


            // console.log(arrvlFlight_totalFare);
            // console.log(arrvlFlight_detailsUrl);
            
            console.log("Return ERR on with Airport: "+err);
            callback(null, hotel_id, arrvlCityCord);
        });

    }

    // function process_data_hotels(url_data, callback){
    //     console.log("Return on: "+url_data);
    //     async.map(url_data, send_data_get, function(err, results){
    //         // results is now an array of stats for each file 
    //         hotelCord = results[0]["HotelInfoList"]["HotelInfo"]["Location"]["GeoLocation"];
    //         hotelCost = results[0]["HotelInfoList"]["HotelInfo"]["Price"]["TotalRate"]["Value"];
    //         hotelURL = results[0]["HotelInfoList"]["HotelInfo"]["DetailsUrl"];

    //         estimate['hotel']['hotel_coordinates']  = {
    //             lat: hotelCord['Latitude'], 
    //             lng: hotelCord['Longitude']
    //         };

    //         estimate['hotel']['cost_range']['low'] = hotelCost;
    //         estimate['hotel']['cost_range']['high'] = hotelCost;

    //         estimate['hotel']['url'] = hotelURL;


    //         console.log(results[0]["HotelInfoList"]["HotelInfo"][0]);
    //         callback(null, results[0]);
    //     });
    // }


    async.waterfall([
        function(callback) {
            //Zipcode to City / State / Zip
            var url_data = ['http://maps.googleapis.com/maps/api/geocode/json?address=94024&sensor=true', 'http://maps.googleapis.com/maps/api/geocode/json?address=10001&sensor=true'];
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

            var dateReturn = "2016-03-05";
            var dateFly = "2016-03-04";
            var url_data1 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateFly+"&departureAirport="+arrvlAirport+"&arrivalAirport="+destAirport+"&maxOfferCount=10&apikey="+apiKey;
            var url_data2 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateReturn+"&departureAirport="+destAirport+"&arrivalAirport="+arrvlAirport+"&maxOfferCount=10&apikey="+apiKey;
            var url_data3 = "http://terminal2.expedia.com:80/x/hotels?maxhotels=10&radius=10km&location="+arrvlCityCord["lat"]+"%2C"+arrvlCityCord["lng"]+"&sort=price&checkInDate="+dateFly+"&checkOutDate="+dateReturn+"&apikey="+apiKey;
            var url_data = [url_data1, url_data2, url_data3];
            process_data_flights(url_data, callback);


        }
        
    ], function (err, result) {
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

// post | create a trip
exports.createTrip = function (req, res){
    console.log('in create trip');

// trip_name: { type: String, required: false },    // friendly name; 
//     status: {type: String, required: true},
//     main_contact: { type: String, required: false }, //sender or receiver
//     sender_name: { type: String, required: true },
//     sender_email: { type: String, required: true },
//     sender_phone: { type: String, required: true },
//     receiver_name: { type: String, required: true },
//     receiver_email: { type: String, required: true },
//     receiver_phone: { type: String, required: true },
//     trip_date: {type: Date, required: true},
//     pickup_address: {
//         address1: { type: String, required: true },
//         address2: { type: String, required: false },
//         city: { type: String, required: true },
//         state: { type: String, required: true },
//         postcode: { type: String, required: true },
//     },
//     dropoff_date: {type: Date, required: false},
//     dropoff_address: {
//         address1: { type: String, required: true },
//         address2: { type: String, required: false },
//         city: { type: String, required: true },
//         state: { type: String, required: true },
//         postcode: { type: String, required: true },
//     },
//     trip_notes: {type: String, required: false},
//     _pets: [{type: mongoose.Schema.Types.ObjectId, ref:'Pet', required: true }],
//     _estimateID: {type: mongoose.Schema.Types.ObjectId, ref:'Estimate', required: false},
//     created_at: Date,
//     updated_at: Date
        // req.body.main_contact = 'sender';
        // req.body.sender_name = 'david';
        // req.body.sender_email = 'doo@asdsad.com';
        // req.body.sender_phone = '12321321321';
        // req.body.receiver_name = 'blah';
        // req.body.receiver_email = 'asdasdsa@asdasdsa.com';
        // req.body.receiver_phone = 'sdfsdfds';
        // req.body.trip_date = '2016-12-12';
        // req.body.pickup_address1 = '123 main street';
        // req.body.pickup_address2 = '21321321';
        // req.body.pickup_city = 'q4qwewqqw';
        // req.body.pickup_state = 'sd';
        // req.body.pickup_postcode = '2132132';

        // req.body.trip_date = '2016-12-12';
        // req.body.pickup_address1 = '123 main street';
        // req.body.pickup_address2 = '21321321';
        // req.body.pickup_city = 'q4qwewqqw';
        // req.body.pickup_state = 'sd';
        // req.body.pickup_postcode = '2132132';

        // req.body.origin_airport_code = 'SFO';
        // req.body.destination_airport_code = 'JFK';

        // req.body.dropoff_address1 = '23232 main street';
        // req.body.dropoff_address2 = '21321321';
        // req.body.dropoff_city = 'q4qwewqqw';
        // req.body.dropoff_state = 'sd';
        // req.body.dropoff_postcode = '2132132';

        // req.body.trip_notes = 'asdasdsa';

        // // req.body.estimateId = 'MONGOTHINGHEREsawqrasdsad';

        // req.body.pet_name = 'fido';
        // req.body.pet_weight = '223';
        // req.body.pet_notes = 'asdasdsadsa';
        // req.body.pet_age = '3243';
        // req.body.pet_species = 'dig';
        // req.body.pet_medical_notes = 'dead';
        // req.body.pet_has_carrier = true;
        // req.body.pet_notes = 'nothing to say';

        console.log('req.body.dropoff_postcode: ', req.body.dropoff_postcode);
        console.log('req.body.sender_phone: ', req.body.sender_phone);

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