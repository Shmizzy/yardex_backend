const express = require('express');
const router = express.Router();
const User = require('../models/user');
const middleware = require('../middleware/authMiddleware');


router.post('/upload', (middleware.auth), async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Authentication required' });

        const profile = await User.findByIdAndUpdate(req.user.id, { pfp: req.body.image }, { new: true });
        res.status(200).json({ profile });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/profile', (middleware.auth), async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Authentication required' });
        const profile = await User.findById(req.user.id);
        res.status(200).json({ profile });
    } catch (error) {
        res.status(400).json({ message: error.message });

    }
});


module.exports = router;