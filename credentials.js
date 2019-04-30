require('dotenv').config({ path: '.env' })

module.exports = {
  username: process.env.username,
  password: process.env.password
}