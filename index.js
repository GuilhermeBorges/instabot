const InstagramBot = require('./Bot')

const potato = new InstagramBot(null, {showBroser: false})

potato.enterInstagram()
  .then(() => potato.finishSession())
