const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
    servicer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicerProfile',
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    }
});

markerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Marker', markerSchema);