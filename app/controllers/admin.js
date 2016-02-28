// Request
var request = require('request');

// async
var async = require('async');

// mongoose
var mongoose = require('mongoose');

// yippee utils
var yippeeUtils = require('../helpers/utils');
var yippeeConstants = require('../helpers/constants');

// Models
var Trip = require('../models/trip');
var Pet = require('../models/pet');
var Estimate = require('../models/estimate');

// get | show admin panel for couriers
exports.trips = function (req, res){
    Trip
    .find()
    .populate('_pets')
    .exec(function(error, trips){
        if(trips){
            res.render('trips',{
                title: 'Yippee Courier Admin',
                trips: trips
            });
        }else if(error){
            console.log("error: " + error);
            res.render('error', {
                error: error
            });
        }
    });
}

// get | show single trip detail
exports.tripDetail = function (req, res){
    var tripId = req.params.trip_id
    var conditions = {'_id' : tripId}
    Trip.findOne(conditions, function(error, trip){
        if(trip){
            res.render('trip-details', {
                trip: trip
            })
        }else if(error){
            console.log("error: " + error);
            res.render('error', {
                error: error
            });
        }
    });            
}
