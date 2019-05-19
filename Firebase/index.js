require('dotenv').config({ path: '.env' })
const firebase = require('firebase-admin')
const config = require(`../${process.env.FIREBASE_DB_KEY}`)

firebase.initializeApp({
  credential: firebase.credential.cert(config),
  databaseURL: process.env.DATABASE_URL //database_config.json, arquivo que baixamos no firebase
})

const database = firebase.database()

const following = (param = '') => database.ref(`following/${param}`);

const followHistory = (param = '') => database.ref(`follow_history/${param}`);

const addFollowing = async username => following(username).set({ username, added: (new Date().getTime()) })

const getFollowings = () => following().once('value').then(data => data.val())

const unFollow = username => following(username).remove().then(() => followHistory(username).set({ username }))

const inHistory = async username => followHistory(username).once('value').then(data => data.val())
