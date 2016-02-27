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
var EstimatorController = require('./app/controllers/estimator');

//Routes
app.get('/', HomesController.index);
app.get('/couriers', HomesController.couriers);
app.get('/scrapbook/:trip_id', HomesController.scrapbook);
app.post('/request-estimate', HomesController.createEstimate);
app.get('/test', EstimatorController.createEstimate);




//Server Launch
app.listen(3000, function () {
    console.log('Yippee App listening on port 3000!');
});
