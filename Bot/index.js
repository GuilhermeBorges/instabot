const puppeteer = require('puppeteer')
const credentials = require('../credentials')
const DEFAULT_VIDEO_WIDTH = 1920 
const DEFAULT_VIDEO_HEIGHT = 1080 
const INSTAGRAM_LOGIN_PAGE_URL = 'https://instagram.com/accounts/login'
const SELECTORS = {
  usernameInput: '[name=username]',
  passwordInput: '[name=password]',
  login_button: 'button[type="submit"]',
  not_now_notification_text_button: 'Not Now',
}
class Botzin {
  constructor(firebaseDb, config) {
    this.firebaseDb = firebaseDb
    this.config = config
    this.page = null
    this.browser = null
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
    return this.page.waitFor(5000).then(() => {
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

  get width() { return (this.config && this.config.video_width) || DEFAULT_VIDEO_WIDTH }
  get heigh() { return (this.config && this.config.video_height) || DEFAULT_VIDEO_HEIGHT }
}

module.exports = Botzin