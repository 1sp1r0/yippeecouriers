//Module Includes
var express = require('express'),
    app = express(),
    router = express.Router(),
    path = require('path'),
    bodyParser = require('body-parser');

//Database Config
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/yippee');

//View Engine Config
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

//Body Parser Config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {
    extended: true
}));

//Public Folder Config
app.use(express.static(path.join(__dirname, 'public')));

//Controllers
var HomesController = require('./app/controllers/homes');

//Routes
app.get('/', HomesController.index);

//Server Launch
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
