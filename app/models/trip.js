var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Trip
var tripSchema = new Schema({
    trip_name: { type: String, required: false, unique: false }, //sender or receiver
    main_contact: { type: String, required: false, unique: false }, //sender or receiver
    sender_name: { type: String, required: false, unique: false },
    sender_email: { type: String, required: false, unique: false },
    sender_phone: { type: String, required: false, unique: false },
    receiver_name: { type: String, required: false, unique: false },
    receiver_email: { type: String, required: false, unique: false },
    receiver_phone: { type: String, required: false, unique: false },
    _pets: [{type: mongoose.Schema.Types.ObjectId, ref:'Pet', required: false }],
    created_at: Date,
    updated_at: Date
});

var Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;