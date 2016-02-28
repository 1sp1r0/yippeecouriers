// Request
var request = require('request');

// async
var async = require('async');

// mongoose
var mongoose = require('mongoose');

// yippee utils
var yippeeUtils = require('yippee-utils');
var yippeeConstants = require('yippee-constants');

// Models
var Trip = require('../models/trip');
var Pet = require('../models/pet');
var Estimate = require('../models/estimate');

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
