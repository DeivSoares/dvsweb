const admin = require("firebase-admin");

const serviceAccount = require("./config/firebase.json");

// evita reinicialização em hot reload / deploy
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),

    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "dvs-painel.appspot.com",
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };