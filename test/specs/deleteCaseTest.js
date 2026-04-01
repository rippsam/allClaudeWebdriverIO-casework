import { expect, browser } from '@wdio/globals'
import NewCase from '../pageobjects/newCase.js'
import Cases from '../pageobjects/cases.js'
import Clients from '../pageobjects/clients.js'

describe('Delete Case - /cases', () => {
    before(async () => {
        await Clients.ensureClientExists(NewCase.retainedByClient)
        await Cases.deleteAllByName(NewCase.deleteHoverName)
        await Cases.deleteAllByName(NewCase.deleteMenuName)
    })

    it('should delete a case via the hover delete button', async () => {
        // MTQA-5226 — create a case then delete it via the hover delete button on /cases
        await NewCase.navigateToNewCase()
        await NewCase.caseNameInput.waitForDisplayed()
        await NewCase.fillCaseName(NewCase.deleteHoverName)
        await NewCase.selectTodayRetainedDate()
        await NewCase.selectRetainedBy(NewCase.retainedByClient)
        await NewCase.clickCreate()
        await NewCase.waitForCreation()

        await Cases.deleteByHover(NewCase.deleteHoverName)

        const bodyText = await browser.execute(() => document.body.innerText)
        expect(bodyText).not.toContain(NewCase.deleteHoverName)
    })

    it('should delete a case via the three-dot menu', async () => {
        // MTQA-5227 — create a case then delete it via the three-dot menu on /cases
        await NewCase.navigateToNewCase()
        await NewCase.caseNameInput.waitForDisplayed()
        await NewCase.fillCaseName(NewCase.deleteMenuName)
        await NewCase.selectTodayRetainedDate()
        await NewCase.selectRetainedBy(NewCase.retainedByClient)
        await NewCase.clickCreate()
        await NewCase.waitForCreation()

        await Cases.deleteByThreeDots(NewCase.deleteMenuName)

        const bodyText = await browser.execute(() => document.body.innerText)
        expect(bodyText).not.toContain(NewCase.deleteMenuName)
    })
})
