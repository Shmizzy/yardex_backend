const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const sendNotification = (token, title, body) => {
    const message = {
        notification: {
            title: title,
            body: body
        },
        token: token
    }

    return admin.messaging().send(message);
};

module.exports = { sendNotification };