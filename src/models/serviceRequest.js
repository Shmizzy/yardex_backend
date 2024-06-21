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
            required: false,
        },
        instructions: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: true
        },
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'completed'],
        default: 'pending'
    }
})


module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);