var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Trip
var tripSchema = new Schema({
    trip_name: { type: String, required: false },    // friendly name; 
    status: {type: String, required: true},
    main_contact: { type: String, required: false }, //sender or receiver
    sender_name: { type: String, required: true },
    sender_email: { type: String, required: true },
    sender_phone: { type: String, required: true },
    receiver_name: { type: String, required: true },
    receiver_email: { type: String, required: true },
    receiver_phone: { type: String, required: true },
    pickup_date: {type: Date, required: true},
    pickup_address: {
        address1: { type: String, required: true },
        address2: { type: String, required: false },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postcode: { type: String, required: true },
    },
    dropoff_date: {type: Date, required: true},
    dropoff_address: {
        address1: { type: String, required: true },
        address2: { type: String, required: false },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postcode: { type: String, required: true },
    },
    trip_notes: {type: String, required: false},
    _pets: [{type: mongoose.Schema.Types.ObjectId, ref:'Pet', required: true }],
    _estimateID: {type: mongoose.Schema.Types.ObjectId, ref:'Estimate', required: false},
    created_at: Date,
    updated_at: Date
});

var Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;