const InstagramBot = require('./Bot')

const potato = new InstagramBot(null, {
  hashTags: ['patata', 'potato', 'batata', 'potatoes', 'friedpotatoes']
}, {showBroser: true})

potato.enterInstagram()
  .then(() => potato.startHashTagsInteraction())
  .then(() => potato.finishSession())
