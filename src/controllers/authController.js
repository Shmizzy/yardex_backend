const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const ServicerProfile = require('../models/servicerProfile');
const validatorMiddleware = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');
const admin = require('../fcm/fcmService');


const router = express.Router();

router.post('/register', [validatorMiddleware.registerValidator], async (req, res) => {
    const errors = validationResult(req);
    if (!errors) return res.status(400).json({ errors });

    const { phoneNumber, idToken, username, email, password, role, bio, servicesOffered, location, servicerStatus } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ msg: 'Email is already registered.' });

        const newUser = await User.create({ phoneNumber, uid, username, email, password, role });
        const savedUser = await newUser.save()
        let servicerProfile = null;
        if (role === 'servicer') {
            servicerProfile = await ServicerProfile.create({
                servicerName: username,
                user: savedUser._id,
                bio,
                servicesOffered,
                location,
                servicerStatus
            });
            const savedServicer = await servicerProfile.save();
        }
        const token = jwt.sign({ user: { id: newUser._id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, id: savedUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/login', [validatorMiddleware.loginValidator], async (req, res) => {
    const errors = validationResult(req);
    if (!errors) return res.status(400).json({ errors });
    const { email, password, idToken } = req.body;
    try {
        let user;
        if (idToken) {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            user = await User.findOne({ uid });
            if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        } else {
            user = await User.findOne({ email });
            if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
            const matchedPassword = await bcrypt.compare(password, user.password);
            if (!matchedPassword) return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        let servicerProfile;
        if (user.role === 'servicer') {
            servicerProfile = await ServicerProfile.findOne({ user: user._id });
            servicerProfile.servicerFcm = req.body.servicerFcm;
            servicerProfile.save();
            return res.status(201).json({ token, id: user._id, servicerId: servicerProfile._id });
        }
        res.status(201).json({ token, id: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;