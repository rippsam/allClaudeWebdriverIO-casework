import { expect, browser } from '@wdio/globals'
import NewCasePage from '../pageobjects/newCase.js'
import CasesPage from '../pageobjects/casesPage.js'
import ClientsPage from '../pageobjects/clientsPage.js'

describe('Create Case - Submit', () => {
    let createdCaseName = null

    before(async () => {
        await ClientsPage.ensureClientExists(NewCasePage.retainedByClient)
    })

    beforeEach(async () => {
        createdCaseName = null
        await NewCasePage.navigateToNewCase()
        await NewCasePage.caseNameInput.waitForDisplayed()
    })

    afterEach(async () => {
        if (createdCaseName) {
            await CasesPage.deleteAllByName(createdCaseName).catch(() => {})
            createdCaseName = null
        }
    })

    it('should create a case with name only and redirect away from new case page', async () => {
        // MTQA-5221 — minimum required fields: case name + retained date + retained by
        createdCaseName = NewCasePage.createMinName
        await NewCasePage.fillCaseName(createdCaseName)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.retainedByClient)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with all fields filled and redirect away from new case page', async () => {
        // MTQA-5222 — all available fields filled
        createdCaseName = NewCasePage.createAllFieldsName
        await NewCasePage.fillCaseName(createdCaseName)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.retainedByClient)
        await NewCasePage.selectFirstCaseType()
        await NewCasePage.selectFirstCaseStatus()
        await NewCasePage.typeDescription('AUTOTEST description')
        await NewCasePage.typeOverview('AUTOTEST overview')
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with a boundary-length case name and redirect away from new case page', async () => {
        // MTQA-5223 — case name at max length (75 chars)
        createdCaseName = 'a'.repeat(75)
        await NewCasePage.fillCaseName(createdCaseName)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.retainedByClient)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with special characters in the name and redirect away from new case page', async () => {
        // MTQA-5224 — SQL injection payload as case name
        createdCaseName = NewCasePage.sqlPayload
        await NewCasePage.fillCaseName(createdCaseName)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.retainedByClient)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })
})
