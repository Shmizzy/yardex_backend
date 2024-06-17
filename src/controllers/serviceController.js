const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ServiceRequest = require('../models/serviceRequest');

router.use(auth);

router.post('/create', async (req, res) => {
    try {
        const {  servicerId, serviceType, preferredTime,
            instructions, location } = req.body;
        const newServiceRequest = await ServiceRequest.create({
            user: req.user.id,
            servicer: servicerId,
            serviceDetails: {
                serviceType,
                preferredTime,
                instructions,
                location
            },
            status: 'pending'
        });
        const createdService = await newServiceRequest.save();
        res.status(201).json({ message: 'Service request created!', createdService });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});

router.put('/:id', async (req, res) => {
    try {
        const servicerId = req.user.id;
        const serviceRequest = await ServiceRequest.findById(req.params.id);
        if (!serviceRequest)
            return res.status(404).json({ message: 'Service Request not found.' });
        if (serviceRequest.servicer.toString() !== servicerId)
            return res.status(400).json({ message: 'Not Authorized!' });
        serviceRequest.status = req.body.status;
        await serviceRequest.save();
        res.status(200).json({ message: 'Service request updated :)', serviceRequest })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find({ servicer: req.user.id });

        res.status(200).json(serviceRequests);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

router.delete('/delete/:id', async (req, res) => {

});

module.exports = router;