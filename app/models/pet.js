var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Pet
var petSchema = new Schema({
    name: { type: String, required: false, unique: false }, //sender or receiver
    weight: { type: Number, required: false, unique: false },
    _trip: {type: mongoose.Schema.Types.ObjectId, ref:'Trip', required: false },
    created_at: Date,
    updated_at: Date
});

var Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;