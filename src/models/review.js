const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    servicer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicerProfile',
        required: true
    },
    rating: {
        type: Number,
        default: 5
    },
    review: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Review', reviewSchema);