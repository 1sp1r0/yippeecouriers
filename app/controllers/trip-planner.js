// HTTP
var http = require('http');

// ASYNC
var async = require('async');

// REQUESTS
var request = require('request');

// mongoose
var mongoose = require('mongoose');

var Estimate = require('../models/estimate');
var Trip = require('../models/trip');
var Pet = require('../models/pet');



exports.viewRoute = function (req, res){

   res.render('trip-planner',{
        title: 'Yippee Air Courier'
    });


  }