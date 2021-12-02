const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
//empleado.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true,
            empleado: false,
            adminSecundario: false,
            adminPrimario: false
        });
    }).then(() => {
        return{
            message: 'Success ${data.email} fas'
        };
    }).catch(err => {
        return err;
    });
});
exports.addAdminSecundarioRole = functions.https.onCall((data, context) => {
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: false,
            empleado: false,
            adminSecundario: true,
            adminPrimario: false
        });
    }).then(() => {
        return{
            message: 'Success ${data.email} fas'
        };
    }).catch(err => {
        return err;
    });
});
exports.addAdminPrimarioRole = functions.https.onCall((data, context) => {
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: false,
            empleado: false,
            adminSecundario: false,
            adminPrimario: true
        });
    }).then(() => {
        return{
            message: 'Success ${data.email} fas'
        };
    }).catch(err => {
        return err;
    });
});
exports.addEmpleadoRole = functions.https.onCall((data, context) => {
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: false,
            empleado: true,
            empresaId: data.empresaId
        });
    }).then(() => {
        return{
            message: 'Success ${data.email} fas'
        };
    }).catch(err => {
        return err;
    });
});
exports.addClienteRole = functions.https.onCall((data, context) => {
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: false,
            empleado: false,
            cliente: true
        });
    }).then(() => {
        return{
            message: 'Success ${data.email} fas'
        };
    }).catch(err => {
        return err;
    });
});
exports.addClienteRoleFacebook = functions.https.onCall((data, context) => {
    return admin.auth().getUser(data.id).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: false,
            empleado: false,
            cliente: true
        });
    }).then(() => {
        return{
            message: 'Success ${data.email} fas'
        };
    }).catch(err => {
        return err;
    });
});
// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});