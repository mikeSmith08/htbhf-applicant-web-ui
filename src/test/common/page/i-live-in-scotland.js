'use strict'

const Page = require('./page')

const PAGE_TITLES = {
  en: 'GOV.UK - You cannot apply if you live in Scotland',
  cy: 'GOV.UK - Sed do eiusmod tempor incididunt ut labore et dolore'
}

/**
 * Page object for I Live in Scotland page where the claimant is told they cannot apply if they live in Scotland.
 */
class ILiveInScotland extends Page {
  async waitForPageLoad (lang = 'en') {
    return super.waitForPageWithTitle(PAGE_TITLES[lang])
  }

  getPath () {
    return '/i-live-in-scotland'
  }

  getPageName () {
    return 'I live in Scotland'
  }

  async getAllBodyText () {
    try {
      const bodyElements = await this.findAllByClassName('govuk-body')
      const textForBodyElements = bodyElements.map(async (element) => element.getText())
      return Promise.all(textForBodyElements)
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }
}

module.exports = ILiveInScotland
