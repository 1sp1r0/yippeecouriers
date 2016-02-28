// Request
var request = require('request');

// mongoose
var mongoose = require('mongoose');

// yippee utils
var yippeeUtils = require('yippee-utils');
var yippeeConstants = require('yippee-constants');

// Models
var Trip = require('../models/trip');
var Pet = require('../models/pet');
var Estimate = require('../models/estimate');

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
    Trip.findOne(conditions, function(error, trip){
        if(trip){
            request('https://slack.com/api/channels.history?token=xoxp-23332966421-23343337041-23368666917-2414cef4be&channel=C0PAUA2AH&pretty=1', function(error, response, body){
                var messages = JSON.parse(body).messages;
                console.log('request body: ', JSON.parse(body).messages);
                res.render('scrapbook',{
                    title: 'Yippee Scrapbook',
                    trip_name: trip.trip_name,
                    trip: trip,
                    messages: messages
                });
            });
        }else if(error){
            console.log("error: " + error.stack);
        }
    });
}

// get | show admin panel for couriers
exports.couriers = function (req, res){
    Trip
    .find()
    .populate('_pets')
    .exec(function(error, trips){
        if(trips){
            res.render('couriers',{
                title: 'Yippee Courier Admin',
                trips: trips
            });
        }else if(error){
            console.log("error: " + error.stack);
        }
    });
}

// post | create an estimate
exports.createEstimate = function (req, res){

    // Erik, do a bunch of stuff here to call the APIs and create the actual estimate

    var estimate = new Estimate({
        trip_name: "Fly Fluffy! Fly!",
        trip_date: '2016-12-23',
        flight: {
            cost_range: {
                low: 209,
                high: 498
            },
            orig_code: 'SFO',
            orig_coordinates: {
                latitude:  -122.387996,
                longitude: 37.61594
            },
            dest_code: 'JFK',
            dest_coordinates: {
                latitude: -73.7789,
                longitude: 37.61594
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

    estimate.save(function(error, savedEstimate) {
        if (error) {
            console.log("Error Saving Estimate: " + error);
        }

        res.json(yippeeUtils.createJsonResponse(error, savedEstimate));
    });
}

// post | create a trip
exports.createTrip = function (req, res){

// trip_name: { type: String, required: false },    // friendly name; 
//     status: {type: String, required: true},
//     main_contact: { type: String, required: false }, //sender or receiver
//     sender_name: { type: String, required: true },
//     sender_email: { type: String, required: true },
//     sender_phone: { type: String, required: true },
//     receiver_name: { type: String, required: true },
//     receiver_email: { type: String, required: true },
//     receiver_phone: { type: String, required: true },
//     pickup_date: {type: Date, required: true},
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


    var trip = new Trip({
        trip_name: req.body.sender_name + ' to ' + req.body.receiver_name,
        status: yippeeConstants.TRIP_STATUS_REQUESTED,
        main_contact: req.body.main_contact,
        sender_name: req.body.sender_name,
        sender_email: req.body.sender_email,
        sender_phone: req.body.sender_phone,
        receiver_name: req.body.receiver_name,
        receiver_email: req.body.receiver_email,
        receiver_phone: req.body.receiver_phone,
        pickup_date: req.body.pickup_date,
        dropoff_date: req.body.dropoff_date,
        // TODO ADDRESS

        trip_notes: req.body.dropoff_date
    });


    trip.save(function (error, savedTrip){
        if(savedTrip){
            var tripId = savedTrip._id;
            var pet = new Pet({
                name: req.body.pet_name,
                _trip: tripId
            });

            pet.save(function (error, savedPet){
                if(savedPet){
                    var petId = savedPet._id;
                    Trip.findOne({_id: tripId}, function (error, foundTrip){
                        if(error){
                            console.log(error);
                        }else if(foundTrip){
                            foundTrip._pets.push(petId);
                            foundTrip.save(function(error){
                                if(error){
                                    console.log(error);
                                }else{
                                    res.redirect('/');
                                    var slackMessage = `New estimate request from *${foundTrip.sender_name}* for their pet *${savedPet.name}*!`
                                    request.post('https://hooks.slack.com/services/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', {json:{"text":slackMessage}});
                                }
                            });
                        }
                    })
                }else if(error){
                    console.log("error: " + error);
                }
            })
        }else if(error){
            console.log("error: " + error);
        }
    });
}