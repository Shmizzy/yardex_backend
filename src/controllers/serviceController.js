const express = require('express');
const router = express.Router();
const middleware = require('../middleware/authMiddleware');
const ServiceRequest = require('../models/serviceRequest');
const io = require('../../app');

router.use(middleware.auth);

router.post('/create', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { serviceType, preferredTime,
            instructions, address } = req.body.serviceDetails;
        const newServiceRequest = await ServiceRequest.create({
            user: req.user.id,
            servicer: req.body.servicer,
            servicerFcm: req.body.servicerFcm,
            userFcm: req.body.userFcm,
            serviceDetails: {
                serviceType,
                preferredTime,
                instructions,
                address
            },
            status: 'pendingServicerAcceptance',
        });
        const createdService = await newServiceRequest.save();
        res.status(201).json({ createdService });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/confirm', async (req, res) => {
    try {
        const serviceRequest = await ServiceRequest.findOne({ user: req.user.id });
        if (!serviceRequest)
            return res.status(404).json({ message: 'Service Request not found.' });
        serviceRequest.status = 'inProgress';
        await serviceRequest.save();
        res.status(200).json({ message: 'Service request updated :)', serviceRequest })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.findOne({ user: req.user.id });

        res.status(200).json(serviceRequests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/status', async (req, res) => {
    try {
        const serviceRequest = await ServiceRequest.findOne({ user: req.user.id });
        if (!serviceRequest)
            return res.status(404).json({ message: 'Request not found.' });
        if (serviceRequest.status === 'inProgress')
            res.status(200).json({ serviceRequest });
        else
            res.status(201).json({ message: 'Request awaiting confirmation from servicer.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.findOneAndDelete({ user: req.user.id });
        console.log('deleted', serviceRequests);
        res.status(200).json(serviceRequests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;