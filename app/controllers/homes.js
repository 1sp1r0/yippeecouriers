// HTTP
var http = require('http');

// mongoose
var mongoose = require('mongoose');

// get | show a list of datasets
exports.index = function (req, res){
  res.render('index',{
    title: 'Yippee Air Courier'
  });
}