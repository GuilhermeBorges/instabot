const InstagramBot = require('./Bot')

const potato = new InstagramBot(null, {hashTags: ['potato']}, {showBroser: true})

potato.enterInstagram()
  .then(() => potato.goToHashTagUrl(potato.hashTags[0]))
  .then(() => potato.vistitPostsLikeAndFollow())
  .then(() => potato.finishSession())
