const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
    chatRoomId: {
        type: String,
        required: true
    },
    images: [],
    messages:[] 
});

module.exports = mongoose.model('GroupChat', groupChatSchema);