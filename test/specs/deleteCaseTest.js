import { expect, browser } from '@wdio/globals'
import NewCasePage from '../pageobjects/newCase.js'
import CasesPage from '../pageobjects/casesPage.js'
import ClientsPage from '../pageobjects/clientsPage.js'

describe('Delete Case - /cases', () => {
    before(async () => {
        await ClientsPage.ensureClientExists(NewCasePage.RETAINED_BY_CLIENT)
        await CasesPage.deleteAllByName(NewCasePage.DELETE_HOVER_NAME)
        await CasesPage.deleteAllByName(NewCasePage.DELETE_MENU_NAME)
    })

    it('should delete a case via the hover delete button', async () => {
        // MTQA-5226 — create a case then delete it via the hover delete button on /cases
        await NewCasePage.navigateToNewCase()
        await NewCasePage.caseNameInput.waitForDisplayed()
        await NewCasePage.fillCaseName(NewCasePage.DELETE_HOVER_NAME)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.RETAINED_BY_CLIENT)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()

        await CasesPage.deleteByHover(NewCasePage.DELETE_HOVER_NAME)

        const bodyText = await browser.execute(() => document.body.innerText)
        expect(bodyText).not.toContain(NewCasePage.DELETE_HOVER_NAME)
    })

    it('should delete a case via the three-dot menu', async () => {
        // MTQA-5227 — create a case then delete it via the three-dot menu on /cases
        await NewCasePage.navigateToNewCase()
        await NewCasePage.caseNameInput.waitForDisplayed()
        await NewCasePage.fillCaseName(NewCasePage.DELETE_MENU_NAME)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.RETAINED_BY_CLIENT)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()

        await CasesPage.deleteByThreeDots(NewCasePage.DELETE_MENU_NAME)

        const bodyText = await browser.execute(() => document.body.innerText)
        expect(bodyText).not.toContain(NewCasePage.DELETE_MENU_NAME)
    })
})
