// Module Includes
var express = require('express'),
    app = express(),
    router = express.Router(),
    path = require('path'),
    bodyParser = require('body-parser');

// Database Config
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/yippee');

// View Engine Config
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

// Body Parser Config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {
    extended: true
}));

// Public Folder Config
app.use(express.static(path.join(__dirname, 'public')));

// Controllers
var HomesController = require('./app/controllers/homes');
var AdminController = require('./app/controllers/admin');
var EstimatorController = require('./app/controllers/estimator');

// Routes - Home
app.get('/', HomesController.index);
app.get('/scrapbook/:trip_id', HomesController.scrapbook);
app.get('/scrapbooktemp', HomesController.scrapbooktemp);
app.post('/create-estimate', HomesController.createEstimate);
app.post('/create-trip', HomesController.createTrip);

// Routes - Estimators
app.get('/test', EstimatorController.createEstimate);

// app.get('/trip-plan/:trip_id', PlannerController.viewRoute);

// Routes - Admin
app.get('/trips', AdminController.trips);
app.get('/trips/:trip_id', AdminController.tripDetail);

// Server Launch
app.listen(3000, function () {
    console.log('Yippee App listening on port 3000!');
});
