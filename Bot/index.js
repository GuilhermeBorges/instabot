const puppeteer = require('puppeteer')
const credentials = require('../credentials')
const DEFAULT_VIDEO_WIDTH = 1920 
const DEFAULT_VIDEO_HEIGHT = 1080 
const BASE_URL = 'https://instagram.com'
const INSTAGRAM_LOGIN_PAGE_URL = `${BASE_URL}/accounts/login`
const SELECTORS = {
  usernameInput: '[name=username]',
  passwordInput: '[name=password]',
  login_button: 'button[type="submit"]',
  not_now_notification_text_button: 'Not Now',
  hashtag_page_selectors : {
    posts_container: '.EZdmt',
    post_heart_grey: 'span.glyphsSpriteHeart__outline__24__grey_9',
    post_username: 'div.e1e1d > h2.BrX75 > a',
    post_like_button: 'span.fr66n > button',
    post_follow_link: '.bY2yH > button',
    post_close_button: 'button.ckWGn',
    button_to_like: 'span.fr66n > button > span[aria-label="Like"]'
  },
}
}
class Botzin {
  constructor(firebaseDb, {
    hashTags
  } ,config) {
    this.firebaseDb = firebaseDb
    this.config = config
    this.likeRatio = config.likeRatio || 1
    this.page = null
    this.browser = null
    this.hashTags = hashTags
    this.selectors = SELECTORS
  }

  setBrowser () {
    const browserOptions = {
      headless: this.config && !this.config.showBroser,
      args: ['--no-sandbox']
    }
    if (this.config && this.config.showBroser) { browserOptions.args.push(`--window-size=${this.width},${this.heigh}`) }
    return puppeteer.launch(browserOptions).then(browser => {
      this.browser = browser
      return this
    })
  }
  setPage () {
    if (!this.browser) throw new Error (`Browser not initialized yet!`)
    return this.browser.newPage().then(page => {
      this.page = page
      this.page.setViewport({ height: this.heigh, width: this.width })
      return this
    })
  }

  enterInstagram () {
    return this.setBrowser()
      .then(() => this.setPage())
      .then(() => this.goToLoginPage())
      .then(() => this.waitForLoading())
      .then(() => this.fillCredentials())
      .then(() => this.login())
      .then(() => this.closeTurnOnNotificationsModal())
      .catch(e => console.error(e))
  }

  goToLoginPage () { return this.page.goto(INSTAGRAM_LOGIN_PAGE_URL) }
  waitForLoading () { return this.page.waitFor(() => document.querySelectorAll('input').length) }
  fillCredentials () {
    return this.page.type(SELECTORS.usernameInput, credentials.username)
      .then(() => this.page.type(SELECTORS.passwordInput, credentials.password))
  }
  login () { return this.page.click(SELECTORS.login_button) }

  closeTurnOnNotificationsModal () {
    return this.pretendToBeHuman(4, 6).then(() => {
      return this.page.evaluate(() => {
        const notNowButton = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Not Now')
        notNowButton.click()
      })
    })
  }

  finishSession () {
    return this.page.waitFor(4000)
      .then(() => this.page.screenshot({ path: 'fizlogin.png' }))
      .then(() => this.browser.close())
  }

  goToHashTagUrl(hashTag) { return this.page.goto(`${BASE_URL}/explore/tags/${hashTag}`) }
  async vistitPostsLikeAndFollow () {
    const followUser = () => this.page.click(SELECTORS.hashtag_page_selectors.post_follow_link)
    const clickOnPost = (row, column) => this.page.click(`${SELECTORS.hashtag_page_selectors.posts_container} > div > div > .Nnq7C:nth-child(${row}) > .v1Nh3:nth-child(${column}) > a`)
    const isNotLiked = () => (this.page.$(SELECTORS.hashtag_page_selectors.button_to_like))
    const getUsername = () => {
      return this.page.evaluate(selectorString => {
        let element = document.querySelector(selectorString)
        return Promise.resolve(element ? element.innerHTML : '')
      }, SELECTORS.hashtag_page_selectors.post_username)
    }
    const likePost = () => this.page.click(SELECTORS.hashtag_page_selectors.post_like_button)
    const isNotFollowing = () => {
      return this.page.evaluate(selectorString => {
        let element = document.querySelector(selectorString)
        return Promise.resolve(element ? element.innerHTML : '')
      }, SELECTORS.hashtag_page_selectors.post_follow_link).then(status => status === 'Follow')
    }
    const closePostModal = () => this.page.click(SELECTORS.hashtag_page_selectors.post_close_button).catch((e) => { console.log('<<< ERROR CLOSING POST >>>' + e.message); console.error(e) })
    for (let r = 1; r < 4; r++) {//loops through each row
      for (let c = 1; c < 4; c++) {//loops through each item in the row

        let postSelected = false
        await clickOnPost(r, c)
          .catch((e) => {
            console.log(e.message)
            postSelected = true
          })
        await this.pretendToBeHuman()
        if (postSelected) continue // if successfully selecting post continue
        if ((await isNotLiked()) && Math.random() < this.likeRatio) {
          await likePost()
          await this.pretendToBeHuman()
        }

        // TODO: adicionar firebase, verificar se já não segui / desegui o usuário
        // let username = await getUsername()
        if (await isNotFollowing()) {
          await followUser()
          await this.pretendToBeHuman()
        }
        await closePostModal()
        await this.pretendToBeHuman()
      }
    }
  }

  pretendToBeHuman (min = 1, max = 5) {
    const waitTimeInMiliseconds = Math.round((min * 1000) + (Math.random() * 1000) % (max * 1000))
    return this.page.waitFor(waitTimeInMiliseconds)
  }
  get width() { return (this.config && this.config.video_width) || DEFAULT_VIDEO_WIDTH }
  get heigh() { return (this.config && this.config.video_height) || DEFAULT_VIDEO_HEIGHT }
}

module.exports = Botzin