const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['User', 'Servicer'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    chatRoomId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Message', messageSchema);