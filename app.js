const dotenv = require('dotenv')
dotenv.config();
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const ServiceRequest = require('./src/models/serviceRequest');
const fcmService = require('./src/fcm/fcmService');

const authController = require('./src/controllers/authController');
const serviceController = require('./src/controllers/serviceController');
const locationsControllers = require('./src/controllers/locationsController');
const GroupChat = require('./src/models/groupChat');
const uploadController = require('./src/cloudinary/upload');
const reviewController = require('./src/controllers/reviewController');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB ' + mongoose.connection.name);
})

app.use(cors());
app.use(express.json());
app.use('/auth', authController);
app.use('/service-request', serviceController);
app.use('/markers', locationsControllers);
app.use('/upload', uploadController);
app.use('/review', reviewController);


const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('user connected : ', socket.id);

    socket.on('update_location', (servicerId, location) => {
        console.log(`location updated -> ${location}`)
        io.emit('servicer_location_update', { servicerId, location });
    });

    socket.on('request_initial_load', async (data) => {
        try {
            const requests = await ServiceRequest.find({ servicer: data.servicerId });
            console.log(`THESE ARE THE REQUESTS -> ${requests}`);
            socket.emit('inital_requests', requests);
        } catch (error) {
            console.log('error fetching requests ->', error)
        }
    })

    socket.on('create_room', (servicerId) => {
        socket.join(`room_${servicerId}`);
        console.log(`Room created for servicer with ID: ${servicerId}`);
    });

    socket.on('join_room', (servicerId) => {
        socket.join(`room_${servicerId}`);
        console.log(`${servicerId} joined room_${servicerId}`)
    });

    socket.on('join_user_room', (userId) => {
        socket.join(`user_room_${userId}`);
        console.log(`${userId} joined user_room_${userId}`);
    })

    socket.on('create_request', (data) => {
        console.log(`sending ${JSON.stringify(data)} to -> room_${data.servicer}`)
        io.to(`room_${data.servicer}`).emit('new_request', data);


        if (data.servicerFcm) {
            fcmService.sendNotification(
                data.servicerFcm,
                'Service Request Created',
                'A service request was created and sent to you!')
                .then(res => console.log('Notification sent successfully: ', res))
                .catch(error => console.log('Error sending notification: ', error));
        }
        else
            console.log('Notifications for this servicer are disabled....');

    });


    socket.on('servicer_confirm', async (confirmationData) => {
        try {
            console.log(`THIS IS THE FUCKING ID ${confirmationData._id}`)
            const request = await ServiceRequest.findById(confirmationData._id);
            request.status = 'pendingUserConfirmation';
            confirmationData.status = 'pendingUserConfirmation';
            request.save();
            io.to(`user_room_${confirmationData.user}`).emit('servicer_confirmation', confirmationData);
            io.to(`room_${confirmationData.servicer}`).emit('status_updated', {
                requestId: request._id,
                status: request.status
            });
            console.log(`sending ${JSON.stringify(confirmationData)} to -> user_room_${confirmationData.user}`)
            console.log(`Confirmation sent to user room: ${confirmationData.user}`);
            fcmService.sendNotification(
                confirmationData.userFcm,
                'Service Request Confirmed',
                'Your service request has been confrimed by the servicer.'
            )
                .then(res => console.log('Notification sent successfully: ', res))
                .catch(error => console.log('Error sending notification: ', error));
        } catch (error) {
            console.log('error confirming request ->', error)
        }
    });

    socket.on('user_confirm', async (requestData) => {
        try {
            const request = await ServiceRequest.findById(requestData._id);
            request.status = 'inProgress';
            requestData.status = 'inProgress';
            request.save();
            io.to(`room_${requestData.servicer}`).emit('user_confirmation', requestData);
            io.to(`room_${requestData.servicer}`).emit('status_updated', {
                requestId: request._id,
                status: request.status
            });
            console.log(`sending ${JSON.stringify(requestData)} to -> room_${requestData.servicer}`)
            console.log(`Confirmation sent to  room: ${requestData.servicer}`);
            fcmService.sendNotification(
                requestData.servicerFcm,
                'Service Request Confirmed by User',
                'Your service request has been confirmed by the user.'
            ).then(res => console.log('Notification sent successfully: ', res))
                .catch(error => console.log('Error sending notification: ', error));
        } catch (error) {
            console.log('error confirming request ->', error)

        }
    });

    socket.on('join_chat_room', async (serviceData) => {
        try {
            const chatId = `chat_room_${serviceData.user}_${serviceData.servicer}`;
            socket.join(chatId);
            const chatRoom = await GroupChat.findOne({ chatRoomId: chatId });
            if (chatRoom == null) {
                chatRoom = await GroupChat.create(
                    { chatRoomId: chatId }
                );
                console.log('created chat room', chatRoom);
            }
            console.log('joined chat room', chatRoom);
        } catch (error) {
            console.log('error creating chat room ->', error)
        }
    })

    socket.on('fetch_chat_messages', async (chatRoom) => {
        try {
            const groupChat = await GroupChat.findOne({ chatRoomId: chatRoom });
            if (!groupChat) {
                console.log('Group chat not found');
                socket.emit('chat_messages', []);
                return;
            }
            const messages = groupChat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            console.log('fetching messages -> ', messages);
            socket.emit('chat_messages', messages);
        } catch (error) {
            console.log('error fetching chat messages ->', error);
        }
    });
    socket.on('chat_message', async (chatData) => {
        try {
            const { sender, message, chatRoomId } = chatData;
            const newMessage = {
                sender, message, chatRoomId
            };
            const groupChat = await GroupChat.findOneAndUpdate({ chatRoomId: chatRoomId }, { $push: { messages: newMessage } },
                { new: true });
            groupChat.save();
            if (!groupChat) {
                console.log('Group chat not found');
                return;
            }
            console.log('sending -> ', chatData)
            io.to(chatRoomId).emit('new_chat_message', chatData);
        } catch (error) {
            console.log('error creating new chat messages ->', error);
        }

    });
    socket.on('imageUploaded', (imageUrl) => {
        console.log('sending ...' ,imageUrl);
    });
    socket.on('update_request', (updateRequest) => {
        io.emit('request_updated', updateRequest)
    });
    socket.on('arrived_to_location', async (serviceData) => {
        try {
            const service = await ServiceRequest.findById(serviceData._id);
            service.serviceDetails.serviceStatus = 'working';
            service.save();
            io.to(`chat_room_${serviceData.user}_${serviceData.servicer}`).emit('update_service_state', service);
        } catch (error) {
            console.log('error updating service progress ->', error);
        }
    });
    socket.on('upload_image', (serviceData, imageUrl) => {
        io.to(`user_room${serviceData.user}`).emit('image_uploaded', imageUrl);
        console.log(`${imageUrl} has been sent to user_room${serviceData.user}`);
    });
    socket.on('finalize_service', async (serviceData) => {
        try {
            const service = await ServiceRequest.findById(serviceData._id);
            service.serviceDetails.serviceStatus = 'complete';
            service.status = 'completed'
            service.save();
            io.to(`user_room${service.user}`).emit('finalized_service', service);
            fcmService.sendNotification(
                service.userFcm,
                'Service has been completed!',
                'Your service is complete!'
            ).then(res => console.log('Notification sent successfully: ', res))
                .catch(error => console.log('Error sending notification: ', error));
        } catch (error) {
            
        }
    });
    socket.on('delete_request', async (requestData) => {
        try {
            console.log('this is the data ', requestData);
            const deletedRequest = await ServiceRequest.findByIdAndDelete(requestData._id);
            const deleteGroupChat = await GroupChat.findOneAndDelete({ chatRoomId: `chat_room_${requestData.user}_${requestData.servicer}` })
            io.emit('request_deleted', deletedRequest);
        } catch (error) {
            console.log('error deleting service ->', error);
        }

    });
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected :)`)
    });
})

server.listen(process.env.PORT ? process.env.PORT : 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT ? process.env.PORT : 3000}`);
});


module.exports = io;