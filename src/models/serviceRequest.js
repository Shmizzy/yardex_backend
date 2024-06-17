const mongoose = require('mongoose');
const user = require('./user');


const serviceRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    servicer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    serviceDetails: {
        serviceType: {
            type: String,
            required: true
        },
        preferredTime: {
            type: Date,
            required: true
        },
        instructions: {
            type: String,
            required: false
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
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed'],
        default: 'pending'
    }
})

serviceRequestSchema.index({ 'location.coordinates': '2dsphere' });


module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);