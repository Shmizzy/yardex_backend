const mongoose = require('mongoose');


const servicerProfileSchema = new mongoose.Schema({
    servicerName: {
        type: String,
        required: true
    },
    servicerFcm: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        required: true
    },
    servicesOffered: [{
        type: String,
        required: true
    }],
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        numberOfRatings: {
            type: Number,
            default: 0
        }
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

servicerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ServicerProfile', servicerProfileSchema);