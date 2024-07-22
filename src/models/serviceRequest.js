const mongoose = require('mongoose');
const user = require('./user');


const serviceRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userFcm: {
        type: String,
        required: false
    },
    servicer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    servicerFcm: {
        type: String,
        required: false
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
    timestamps: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        statusUpdatedAt: {
            type: Date
        }
    },
    cancellation: {
        cancelledBy: {
            type: String,
            enum: ['user', 'servicer'],
            required: false
        },
        cancellationReason: {
            type: String,
            required: false
        }
    },
    paymentDetails: {
        price: {
            type: Number,
            required: false
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'processed', 'failed'],
            default: 'pending'
        }
    },
    status: {
        type: String,
        enum: ['pendingServicerAcceptance', 'pendingUserConfirmation', 'confirmed', 'inProgress', 'pendingUserReview', 'completed'],
        default: 'pendingServicerAcceptance'
    }
})


module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);