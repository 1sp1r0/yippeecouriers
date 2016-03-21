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