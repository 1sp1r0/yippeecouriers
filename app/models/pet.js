var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Pet
var petSchema = new Schema({
    name: { type: String, required: true },
    image_url: { type: String, required: false },
    species: { type: String, required: true },
    weight: { type: Number, required: true },
    age: {type: Number, required: true },
    medical_notes: {type: String, required: true },
    has_carrier: {type: Boolean, required: true },
    created_at: Date,
    updated_at: Date
});

var Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;