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

        req.body.main_contact = 'sender';
        req.body.sender_name = 'david';
        req.body.sender_email = 'doo@asdsad.com';
        req.body.sender_phone = '12321321321';
        req.body.receiver_name = 'blah';
        req.body.receiver_email = 'asdasdsa@asdasdsa.com';
        req.body.receiver_phone = 'sdfsdfds';
        req.body.trip_date = '2016-12-12';
        req.body.pickup_address1 = '123 main street';
        req.body.pickup_address2 = '21321321';
        req.body.pickup_city = 'q4qwewqqw';
        req.body.pickup_state = 'sd';
        req.body.pickup_postcode = '2132132';

        req.body.trip_date = '2016-12-12';
        req.body.pickup_address1 = '123 main street';
        req.body.pickup_address2 = '21321321';
        req.body.pickup_city = 'q4qwewqqw';
        req.body.pickup_state = 'sd';
        req.body.pickup_postcode = '2132132';

        req.body.origin_airport_code = 'SFO';
        req.body.destination_airport_code = 'JFK';

        req.body.dropoff_address1 = '23232 main street';
        req.body.dropoff_address2 = '21321321';
        req.body.dropoff_city = 'q4qwewqqw';
        req.body.dropoff_state = 'sd';
        req.body.dropoff_postcode = '2132132';

        req.body.trip_notes = 'asdasdsa';

        // req.body.estimateId = 'MONGOTHINGHEREsawqrasdsad';

        req.body.pet_name = 'fido';
        req.body.pet_weight = '223';
        req.body.pet_notes = 'asdasdsadsa';
        req.body.pet_age = '3243';
        req.body.pet_species = 'dig';
        req.body.pet_medical_notes = 'dead';
        req.body.pet_has_carrier = true;
        req.body.pet_notes = 'nothing to say';

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