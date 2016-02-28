// Request
var request = require('request');

// async
var async = require('async');

// Cheerio Scraper
var cheerio = require('cheerio');

// mongoose
var mongoose = require('mongoose');

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
    Trip.findOne(conditions, function(error, trip){
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

                    console.log(processedMessages);

                    res.render('scrapbook',{
                        title: 'Yippee Scrapbook',
                        trip_name: trip.trip_name,
                        trip: trip,
                        messages: processedMessages
                    });
                }

                async.eachSeries(originalMessages, messageParser, messageErrorCallback);


                // for (var message of originalMessages) {
                //     if(message.file){
                //         var fileId = message.file.id;
                //         if(message.file.public_url_shared){
                //             request('https://slack.com/api/files.info?token=' + slackToken + '&file=' + fileId + '&pretty=1', function(error, response, body){
                //                 request(JSON.parse(body).file.permalink_public, function(error, response, body){
                //                     var $ = cheerio.load(body);
                //                     var imageUrl = $('.image_body').attr("href");
                //                     // console.log('Public URL: ', $('.image_body').attr("href"));
                //                     processedMessages.push({'file' : imageUrl});
                //                     console.log('push: ', {'file' : imageUrl});
                //                 });
                //             });
                //         }else{
                //             request('https://slack.com/api/files.sharedPublicURL?token=' + slackToken + '&file=' + fileId + '&pretty=1', function(error, response, body){
                //                 request(JSON.parse(body).file.permalink_public, function(error, response, body){
                //                     var imageUrl = $('.image_body').attr("href");
                //                     // console.log('Public URL: ', $('.image_body').attr("href"));
                //                     processedMessages.push({'file' : imageUrl});
                //                 });
                //             });
                //         }
                //     }else{
                //         // console.log(message.text);
                //         processedMessages.push({'text' : message.text});
                //     }
                // }
                // console.log('originalMessages: ', originalMessages);
                // console.log('processedMessages: ', processedMessages);

                // console.log('file id: ', JSON.parse(body).messages);
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
        trip_date: '2016-12-16',
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
        if(savedEstimate){
            console.log(savedEstimate);
        }else if(error){
            console.log("error: " + error);
        }
    });
}

// post | create a trip
exports.createTrip = function (req, res){
    var trip = new Trip({
        trip_name: req.body.trip_name,
        sender_name: req.body.contact_name,
        sender_email: req.body.email,
        sender_phone: req.body.phone
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