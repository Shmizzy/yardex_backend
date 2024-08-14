const mongoose = require('mongoose');


const servicerProfileSchema = new mongoose.Schema({
    servicerName: {
        type: String,
        required: true
    },
    pfp: { type: String, required: false },
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
        required: false
    },
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
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
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