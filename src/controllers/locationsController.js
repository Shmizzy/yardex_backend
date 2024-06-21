const express = require('express');
const router = express.Router();
const ServicerProfile = require('../models/servicerProfile');


router.get('/', async (req, res) => {
    try {
        const servicerLocations = await ServicerProfile.find({})

        res.status(200).json(servicerLocations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const servicerLocations = await ServicerProfile.findById(req.params.id);

        res.status(200).json(servicerLocations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



module.exports = router;