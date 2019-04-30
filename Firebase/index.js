require('dotenv').config({ path: '.env' })
const admin = require('firebase-admin')
const serviceAccount = require(process.env.FIREBASE_DB_KEY)


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_KEY
})
