import { expect, browser } from '@wdio/globals'
import NewCase from '../pageobjects/newCase.js'
import Cases from '../pageobjects/cases.js'
import Clients from '../pageobjects/clients.js'

describe('Create Case - Submit', () => {
    let createdCaseName = null

    before(async () => {
        await Clients.ensureClientExists(NewCase.retainedByClient)
    })

    beforeEach(async () => {
        createdCaseName = null
        await NewCase.navigateToNewCase()
        await NewCase.caseNameInput.waitForDisplayed()
    })

    afterEach(async () => {
        if (createdCaseName) {
            await Cases.deleteAllByName(createdCaseName).catch(() => {})
            createdCaseName = null
        }
    })

    it('should create a case with name only and redirect away from new case page', async () => {
        // MTQA-5221 — minimum required fields: case name + retained date + retained by
        createdCaseName = NewCase.createMinName
        await NewCase.fillCaseName(createdCaseName)
        await NewCase.selectTodayRetainedDate()
        await NewCase.selectRetainedBy(NewCase.retainedByClient)
        await NewCase.clickCreate()
        await NewCase.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with all fields filled and redirect away from new case page', async () => {
        // MTQA-5222 — all available fields filled
        createdCaseName = NewCase.createAllFieldsName
        await NewCase.fillCaseName(createdCaseName)
        await NewCase.selectTodayRetainedDate()
        await NewCase.selectRetainedBy(NewCase.retainedByClient)
        await NewCase.selectFirstCaseType()
        await NewCase.selectFirstCaseStatus()
        await NewCase.typeDescription('AUTOTEST description')
        await NewCase.typeOverview('AUTOTEST overview')
        await NewCase.clickCreate()
        await NewCase.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with a boundary-length case name and redirect away from new case page', async () => {
        // MTQA-5223 — case name at max length (75 chars)
        createdCaseName = 'a'.repeat(75)
        await NewCase.fillCaseName(createdCaseName)
        await NewCase.selectTodayRetainedDate()
        await NewCase.selectRetainedBy(NewCase.retainedByClient)
        await NewCase.clickCreate()
        await NewCase.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })

    it('should create a case with special characters in the name and redirect away from new case page', async () => {
        // MTQA-5224 — SQL injection payload as case name
        createdCaseName = NewCase.sqlPayload
        await NewCase.fillCaseName(createdCaseName)
        await NewCase.selectTodayRetainedDate()
        await NewCase.selectRetainedBy(NewCase.retainedByClient)
        await NewCase.clickCreate()
        await NewCase.waitForCreation()
        await expect(browser).not.toHaveUrl(expect.stringContaining('/case/new'))
    })
})
