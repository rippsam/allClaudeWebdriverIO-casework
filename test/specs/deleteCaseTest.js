import { expect, browser } from '@wdio/globals'
import NewCasePage from '../pageobjects/newCase.js'
import CasesPage from '../pageobjects/casesPage.js'
import ClientsPage from '../pageobjects/clientsPage.js'

describe('Delete Case - /cases', () => {
    before(async () => {
        await ClientsPage.ensureClientExists(NewCasePage.retainedByClient)
        await CasesPage.deleteAllByName(NewCasePage.deleteHoverName)
        await CasesPage.deleteAllByName(NewCasePage.deleteMenuName)
    })

    it('should delete a case via the hover delete button', async () => {
        // MTQA-5226 — create a case then delete it via the hover delete button on /cases
        await NewCasePage.navigateToNewCase()
        await NewCasePage.caseNameInput.waitForDisplayed()
        await NewCasePage.fillCaseName(NewCasePage.deleteHoverName)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.retainedByClient)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()

        await CasesPage.deleteByHover(NewCasePage.deleteHoverName)

        const bodyText = await browser.execute(() => document.body.innerText)
        expect(bodyText).not.toContain(NewCasePage.deleteHoverName)
    })

    it('should delete a case via the three-dot menu', async () => {
        // MTQA-5227 — create a case then delete it via the three-dot menu on /cases
        await NewCasePage.navigateToNewCase()
        await NewCasePage.caseNameInput.waitForDisplayed()
        await NewCasePage.fillCaseName(NewCasePage.deleteMenuName)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.retainedByClient)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()

        await CasesPage.deleteByThreeDots(NewCasePage.deleteMenuName)

        const bodyText = await browser.execute(() => document.body.innerText)
        expect(bodyText).not.toContain(NewCasePage.deleteMenuName)
    })
})
