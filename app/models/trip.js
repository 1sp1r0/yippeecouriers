var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Trip
var tripSchema = new Schema({
    main_contact: { type: String, required: true, unique: false }, //sender or receiver
    sender_email: { type: String, required: true, unique: false },
    sender_phone: { type: String, required: true, unique: false },
    receiver_email: { type: String, required: true, unique: false },
    receiver_phone: { type: String, required: true, unique: false },
    _pets: [{type: mongoose.Schema.Types.ObjectId, ref:'Pet', required: false }],
    created_at: Date,
    updated_at: Date
});

var Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;