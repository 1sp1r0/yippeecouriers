var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Pet
var estimateSchema = new Schema({
    trip_id: { type: Number, required: false },
    trip_date: { type: String, required: false },
    ride: {
        cost_to: { type: String, required: false },
        cost_from: { type: String, required: false },
    },
    flight: { 
        cost_range: {
            low: { type: Number, required: true },
            high: { type: Number, required: true },
        },
        orig_id: { type: String, required: true },
        orig_url: { type: String, required: true },
        orig_carrier: { type: String, required: false },
        orig_name: { type: String, required: true },
        miles: { type: Number, required: false },
        orig_coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        orig_air_code: { type: String, required: true },
        orig_air_coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        dest_id: { type: String, required: true },
        dest_url: { type: String, required: true },
        dest_carrier: { type: String, required: false },
        dest_name: { type: String, required: true },
        dest_coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        dest_air_code: { type: String, required: true },
        dest_air_coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        dest_air_code: { type: String, required: true },
    },
    hotel: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        location: { type: String, required: true },
        url: { type: String, required: true },
        cost_range: {
            low: { type: Number, required: true },
            high: { type: Number, required: true },
        },
        hotel_coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
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
