var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Pet
var estimateSchema = new Schema({
    departure_date: { type: Date, required: true },
    return_date:  { type: Date, required: true },   
    flight: { 
        cost_range: {
            low: { type: Number, required: true },
            high: { type: Number, required: true },
        },
        orig_code: { type: String, required: true },
        orig_coordinates: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        dest_code: { type: String, required: true },
        dest_coordinates: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
    },
    hotel: {
        cost_range: {
            low: { type: Number, required: true },
            high: { type: Number, required: true },
        },
    },
    airline_pet_fee:  { type: Number, required: true },
    yippee_fee:  { type: Number, required: true },
    misc_fee: { type: Number, required: false },
    total_fee: {
        low: { type: Number, required: true },
        high: { type: Number, required: true },
    },
    created_at: Date,
    updated_at: Date
});

var Estimate = mongoose.model('Estimate', estimateSchema);
module.exports = Estimate;
