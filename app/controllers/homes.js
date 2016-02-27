// HTTP
var http = require('http');

// mongoose
var mongoose = require('mongoose');

// Models
var Trip = require('../models/trip');
var Pet = require('../models/pet');

// get | show a list of datasets
exports.index = function (req, res){
	res.render('index',{
		title: 'Yippee Air Courier'
	});
}

// post | create a dataset
exports.createEstimate = function (req, res){
    var trip = new Trip({
        sender_name: req.body.name,
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
                                }
                            });
                        }
                    })
                }else if(error){
                    console.log("error: " + error.stack);
                }
            })
        }else if(error){
            console.log("error: " + error.stack);
        }
    });
}