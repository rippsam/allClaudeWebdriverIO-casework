import { expect, browser } from '@wdio/globals'
import NewCasePage from '../pageobjects/newCase.js'
import ClientsPage from '../pageobjects/clientsPage.js'

describe('Create Case - Submit', () => {
    before(async () => {
        await ClientsPage.ensureClientExists(NewCasePage.RETAINED_BY_CLIENT)
    })

    beforeEach(async () => {
        await NewCasePage.navigateToNewCase()
        await NewCasePage.caseNameInput.waitForDisplayed()
    })

    it('should create a case with name only and redirect away from new case page', async () => {
        // MTQA-5221 — minimum required fields: case name + retained date + retained by
        await NewCasePage.fillCaseName(NewCasePage.CREATE_MIN_NAME)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.RETAINED_BY_CLIENT)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with all fields filled and redirect away from new case page', async () => {
        // MTQA-5222 — all available fields filled
        await NewCasePage.fillCaseName(NewCasePage.CREATE_ALL_FIELDS_NAME)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.RETAINED_BY_CLIENT)
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
        await NewCasePage.fillCaseName('a'.repeat(75))
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.RETAINED_BY_CLIENT)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with special characters in the name and redirect away from new case page', async () => {
        // MTQA-5224 — SQL injection payload as case name
        await NewCasePage.fillCaseName(NewCasePage.SQL_PAYLOAD)
        await NewCasePage.selectTodayRetainedDate()
        await NewCasePage.selectRetainedBy(NewCasePage.RETAINED_BY_CLIENT)
        await NewCasePage.clickCreate()
        await NewCasePage.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })
})
