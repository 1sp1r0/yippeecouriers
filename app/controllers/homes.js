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