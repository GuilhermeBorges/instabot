const puppeteer = require('puppeteer')
const credentials = require('../credentials')
const SELECTORS = require('./selectors')
const {DEFAULT_VIDEO_WIDTH, DEFAULT_VIDEO_HEIGHT, BASE_URL} = require('../config')
const HashTagPage = require('./HashTagPage')
const INSTAGRAM_LOGIN_PAGE_URL = `${BASE_URL}/accounts/login`
const DAO = require('../Firebase')

class Botzin {
  constructor(firebaseDb, {
    hashTags
  }, config) {
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
      .then(this.setPage.bind(this))
      .then(this.goToLoginPage.bind(this))
      .then(this.waitForLoading.bind(this))
      .then(this.pretendToBeHuman.bind(this))
      .then(this.fillCredentials.bind(this))
      .then(this.pretendToBeHuman.bind(this))
      .then(this.login.bind(this))
      .then(this.pretendToBeHuman.bind(this))
      .then(this.closeTurnOnNotificationsModal.bind(this))
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

  async startHashTagsInteraction () {
    const shuffle = (array) => array.slice().sort(() => Math.random() - 0.5)
    const hashTagArray = shuffle(this.hashTags)
    for (let index = 0; index < hashTagArray.length; index ++) {
      await this.handleHashTag(hashTagArray[index])
    }
  }

  async handleHashTag (hashTag) {
    const hashTagHandler = new HashTagPage({ page: this.page, hashTag })
    await hashTagHandler.goToHashTagPage()
    const posts = hashTagHandler.getFirst9Posts()
    for (let index = 0; index < posts.length; index ++) {
      let errorClicking = false
      await hashTagHandler.clickOnPost(posts[index]).catch(e => {console.log(e); errorClicking = true})
      if (errorClicking) continue
      await this.pretendToBeHuman()

      const isNotLiked = await hashTagHandler.isNotLiked()
      if (isNotLiked && Math.random() < this.likeRatio) {
        await hashTagHandler.likePost()
        await this.pretendToBeHuman()
      }

      const username = await this.page.evaluate(x => {
        let element = document.querySelector(x);
        return Promise.resolve(element ? element.innerHTML : '')
      }, this.selectors.hashtag_page_selectors.post_username)

      const isNotFollowing = await hashTagHandler.isNotFollowing()
      if (isNotFollowing) {
        const isInHistory = await DAO.inHistory(username)
        if (!isInHistory) {
          await hashTagHandler.followUser()
          await DAO.addFollowing(username)
          await this.pretendToBeHuman()
        }
      }

      await hashTagHandler.closePostModal()
      await this.pretendToBeHuman()
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