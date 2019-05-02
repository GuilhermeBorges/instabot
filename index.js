const InstagramBot = require('./Bot')

const potato = new InstagramBot(null, {hashTags: ['potato', 'batata']}, {showBroser: true})

potato.enterInstagram()
  .then(() => potato.startHashTagsInteraction())
  .then(() => potato.finishSession())
