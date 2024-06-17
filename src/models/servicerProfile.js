const mongoose = require('mongoose');


const servicerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
        unique: true // Ensures one-to-one relationship with User model
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
    }
});

module.exports = mongoose.model('ServicerProfile', servicerProfileSchema);