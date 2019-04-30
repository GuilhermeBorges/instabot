const puppeteer = require('puppeteer')
const credentials = require('./credentials')

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--window-size=1920,1080'
    ]
  })
  const page = await browser.newPage()
  page.setViewport({height: 1080, width: 1920})
  await page.goto('https://instagram.com/accounts/login')
  await page.waitFor(() => document.querySelectorAll('input').length) //espera os campos existirem

  await page.type('[name=username]', credentials.username)
  await page.type('[name=password]', credentials.password)

  // Qualquer coisa dentro do evaluate vai rodar no browser
  await page.evaluate(() => {
    document.querySelector('button[type=\"submit\"]').click()
  })

  await page.waitFor(4000)
  // await page.screenshot({ path: 'insta.png' })
  await browser.close()
})()