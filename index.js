const SHOW_BROWSER = true
const VIDEO_HEIGHT = 1080
const VIDEO_WIDTH = 1920
const puppeteer = require('puppeteer')
const credentials = require('./credentials')

  ; (async () => {
    await main().then(browser => browser.newPage())
  })()

function main() {
  let browser
  return getAndSetBrowser(browser)
    .then(getPage)
    .then(goToLoginPage)
    .then(waitForLoading)
    .then(fillCredentials)
    .then(login)
    .then(page => finishSession(page, browser))
}

function getAndSetBrowser(browser) {
  return puppeteer.launch(browserOptions)
    .then(b => {
      browser = b
      return browser
    })
}

function browserOptions(options) {
  if (!options) options = {}
  return showBrowser(SHOW_BROWSER, options)
}
function showBrowser(bool, options) {
  options.headless = !bool
  if (!options.args) options.args = []
  options.args.push(`--window-size=${VIDEO_WIDTH},${VIDEO_HEIGHT}`)
  return showBroser
}
function getPage(browser) {
  return browser.newPage().then(page => {
    page.setViewport({ height: 1080, width: 1920 })
    return page
  })
}

function goToLoginPage(page) {
  return page.goto('https://instagram.com/accounts/login').then(() => page)
}
function waitForLoading(page) {
  return page.waitFor(() => document.querySelectorAll('input').length).then(() => page)
}
function fillCredentials(page) {
  return page.type('[name=username]', credentials.username)
    .then(() => page.type('[name=password]', credentials.password))
    .then(() => page)
}
function login(page) {
  return page.evaluate(() => {
    const botoesLogin = Array.from(document.querySelectorAll('button'))
      .filter(button => /log in/gi.test(button.innerText))
    if (botoesLogin.length > 0) botoesLogin[0].click()
  }).then(() => page)
}

function finishSession(page, browser) {
  return page.waitFor(4000)
    .then(() => page.screenshot({ path: 'fizlogin.png' }))
    .then(() => browser.close())
}