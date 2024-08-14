const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    pfp: { type: String, required: false },
    password: { type: String, required: true },
    phoneNumber: String,
    uid: String,
    role: {
        type: String,
        required: true,
        enum: ['user', 'servicer'],
        default: 'user'
    }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.password;
    }
})

module.exports = mongoose.model('User', userSchema);