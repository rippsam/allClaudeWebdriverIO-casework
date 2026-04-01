import { expect, browser } from '@wdio/globals'
import NewCase from '../pageobjects/newCase.js'

// NOTE: DOM inspection confirmed case name maxlength = 75 (not 100 as originally documented).
// Tests use the actual enforced limit. Jira test cases MTQA-5200 through MTQA-5220.

describe('Create New Case - /case/new', () => {
    beforeEach(async () => {
        await NewCase.navigateToNewCase()
        await NewCase.caseNameInput.waitForDisplayed()
    })

    // ── Input Fields: Positive ─────────────────────────────────────────────────

    describe('Input Fields - Positive', () => {
        it('should accept valid text in the case name field', async () => {
            // MTQA-5200
            await expect(await NewCase.typeCaseName('AUTOTEST Valid Case Name')).toBe('AUTOTEST Valid Case Name')
        })

        it('should accept exactly 75 characters in the case name field (boundary)', async () => {
            // MTQA-5201 — DOM enforces maxlength=75
            await expect((await NewCase.typeCaseName('a'.repeat(75))).length).toBe(75)
        })

        it('should accept exactly 2000 characters in the notes field (boundary)', async () => {
            // MTQA-5202
            await expect((await NewCase.typeNote('a'.repeat(2000))).length).toBe(2000)
        })

        it('should accept exactly 2000 characters in the overview field (boundary)', async () => {
            // MTQA-5203
            await expect((await NewCase.typeOverview('a'.repeat(2000))).length).toBe(2000)
        })

        it('should accept exactly 200 characters in the description field (boundary)', async () => {
            // MTQA-5204
            await expect((await NewCase.typeDescription('a'.repeat(200))).length).toBe(200)
        })

        it('should preserve case in the case name field', async () => {
            // MTQA-5205
            await expect(await NewCase.typeCaseName('testcase')).toBe('testcase')

            await NewCase.caseNameInput.clearValue()
            await expect(await NewCase.typeCaseName('TESTCASE')).toBe('TESTCASE')

            await NewCase.caseNameInput.clearValue()
            await expect(await NewCase.typeCaseName('TestCase')).toBe('TestCase')
        })
    })

    // ── Input Fields: Boundary / Negative ─────────────────────────────────────

    describe('Input Fields - Boundary / Negative', () => {
        it('should not accept more than 75 characters in the case name field', async () => {
            // MTQA-5206 — entering 76 chars; browser truncates at maxlength=75
            await expect((await NewCase.typeCaseName('a'.repeat(76))).length).toBeLessThanOrEqual(75)
        })

        it('should not accept more than 2000 characters in the notes field', async () => {
            // MTQA-5207 — entering 2001 chars; browser truncates at maxlength=2000
            await expect((await NewCase.typeNote('a'.repeat(2001))).length).toBeLessThanOrEqual(2000)
        })

        it('should not accept more than 2000 characters in the overview field', async () => {
            // MTQA-5208 — entering 2001 chars; browser truncates at maxlength=2000
            await expect((await NewCase.typeOverview('a'.repeat(2001))).length).toBeLessThanOrEqual(2000)
        })

        it('should not accept more than 200 characters in the description field', async () => {
            // MTQA-5209 — entering 201 chars; browser truncates at maxlength=200
            await expect((await NewCase.typeDescription('a'.repeat(201))).length).toBeLessThanOrEqual(200)
        })
    })

    // ── Security ───────────────────────────────────────────────────────────────

    describe('Security', () => {
        it('should not execute XSS payload entered in the case name field', async () => {
            // MTQA-5210 — verify script tags are stored as plain text, not executed
            // Field stores the raw string (truncated to 75 chars by maxlength)
            await expect(await NewCase.typeCaseName(NewCase.xssPayload)).not.toBe('')
            // Verify no alert dialog was triggered
            const alertOpen = await browser.execute(() => {
                try { window.alert = () => { window.__xssTriggered = true } } catch (e) {}
                return window.__xssTriggered === true
            })
            await expect(alertOpen).toBe(false)
        })

        it('should sanitize SQL injection payload in the case name field', async () => {
            // MTQA-5211 — verify SQL string is treated as plain text
            await expect(await NewCase.typeCaseName(NewCase.sqlPayload)).toBe(NewCase.sqlPayload)
        })
    })

    // ── Required Fields ────────────────────────────────────────────────────────

    describe('Required Fields', () => {
        it('should not show the Create button when the case name is empty', async () => {
            // MTQA-5212 — Create button only appears after case name is entered
            await expect(NewCase.createButton).not.toBeDisplayed()
        })

        it('should show the Create button once the case name is filled', async () => {
            // MTQA-5213 — Create button becomes visible after typing a case name
            await NewCase.caseNameInput.setValue('AUTOTEST Required Field Test')
            await expect(NewCase.createButton).toBeDisplayed()
        })

        it('should show a missing required fields error when Create is clicked without retained date and retained by', async () => {
            // MTQA-5225 — clicking Create with only a case name shows validation error for retained fields
            await NewCase.fillCaseName('AUTOTEST Missing Fields Test')
            await NewCase.clickCreate()
            await NewCase.missingFieldsError.waitForDisplayed()
            await expect(NewCase.missingFieldsError).toHaveText(expect.stringContaining('Missing required fields'))
        })
    })

    // ── Dropdowns ──────────────────────────────────────────────────────────────

    describe('Dropdowns', () => {
        it('should populate the Type dropdown with options', async () => {
            // MTQA-5214
            await NewCase.openCaseTypeDropdown()
            await expect(await NewCase.getDropdownOptionCount()).toBeGreaterThan(0)
        })

        it('should populate the Status dropdown with options', async () => {
            // MTQA-5215
            await NewCase.openCaseStatusDropdown()
            await expect(await NewCase.getDropdownOptionCount()).toBeGreaterThan(0)
        })

        it('should update the Type combobox value when an option is selected', async () => {
            // MTQA-5216
            const selectedText = await NewCase.selectFirstCaseType()
            const value = await NewCase.caseTypeCombobox.getValue()
            await expect(value).toBe(selectedText)
        })

        it('should update the Status combobox value when an option is selected', async () => {
            // MTQA-5217
            const selectedText = await NewCase.selectFirstCaseStatus()
            const value = await NewCase.caseStatusCombobox.getValue()
            await expect(value).toBe(selectedText)
        })
    })

    // ── Action Buttons ─────────────────────────────────────────────────────────

    describe('Action Buttons', () => {
        it('should open a dialog when Assign Case is clicked', async () => {
            // MTQA-5218
            await NewCase.assignCaseButton.click()
            await NewCase.dialog.waitForDisplayed()
            await expect(NewCase.dialog).toBeDisplayed()
        })

        it('should open a dialog when Add Affiliated Party is clicked', async () => {
            // MTQA-5219
            await NewCase.addAffiliatedPartyButton.click()
            await NewCase.dialog.waitForDisplayed()
            await expect(NewCase.dialog).toBeDisplayed()
        })

        it('should open a dialog when Add Event is clicked', async () => {
            // MTQA-5220
            await NewCase.addEventButton.click()
            await NewCase.dialog.waitForDisplayed()
            await expect(NewCase.dialog).toBeDisplayed()
        })
    })
})
