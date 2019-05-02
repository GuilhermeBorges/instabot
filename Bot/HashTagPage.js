const SELECTORS = require('./selectors')
const { BASE_URL } = require('../config')

class HashTagPage {
  constructor({
    page,
    hashTag
  }) {
    this.page = page
    this.hashTag = hashTag
    this.url = `${BASE_URL}/explore/tags/${hashTag}`
  }
  goToHashTagPage () { return this.page.goto(this.url) }
  followUser () { return this.page.click(SELECTORS.hashtag_page_selectors.post_follow_link) }
  clickOnPost (post) { return this.page.click(post)}
  isNotLiked () { return this.page.$(SELECTORS.hashtag_page_selectors.button_to_like) }
  getUsername () {
    return this.page.evaluate(selectorString => {
      let element = document.querySelector(selectorString)
      return Promise.resolve(element ? element.innerHTML : '')
    }, SELECTORS.hashtag_page_selectors.post_username)
  }
  likePost () { return this.page.click(SELECTORS.hashtag_page_selectors.post_like_button) }
  isNotFollowing () {
    return this.page.evaluate(selectorString => {
      let element = document.querySelector(selectorString)
      return Promise.resolve(element ? element.innerHTML : '')
    }, SELECTORS.hashtag_page_selectors.post_follow_link).then(status => status === 'Follow')
  }
  closePostModal () { return this.page.click(SELECTORS.hashtag_page_selectors.post_close_button).catch((e) => { console.log('<<< ERROR CLOSING POST >>>' + e.message); console.error(e) }) }

  getFirst9Posts () {
    let posts = []
    for (let row = 1; row <= 3; row++) {
      for (let column = 1; column <= 3; column++) {
        posts.push(`${SELECTORS.hashtag_page_selectors.posts_container} > div > div > .Nnq7C:nth-child(${row}) > .v1Nh3:nth-child(${column}) > a`)
      }
    }
    return posts
  }
}

module.exports = HashTagPage
