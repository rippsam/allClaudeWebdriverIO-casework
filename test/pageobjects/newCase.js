import { $, $$, browser } from '@wdio/globals'
import Base from './base.js'

class NewCase extends Base {
    constructor() {
        super()
        const now = new Date()
        this._ts = now.toISOString().replace('T', ' ').slice(0, 19)
    }

    // ── Test data ─────────────────────────────────────────────────────────────
    get xssPayload() { return "<script>alert('xss')</script>" }
    get sqlPayload() { return "' OR '1'='1" }
    get maxLengthCaseName() { return 'a'.repeat(75) }
    get retainedByClient() { return 'AUTOTEST Client' }
    get createMinName()       { return `AUTOTEST Create Min ${this._ts}` }
    get createAllFieldsName() { return `AUTOTEST Create All Fields ${this._ts}` }
    get deleteHoverName()     { return `AUTOTEST Delete Hover ${this._ts}` }
    get deleteMenuName()      { return `AUTOTEST Delete ThreeDots ${this._ts}` }
    get validCaseName()       { return `AUTOTEST Valid Case Name ${this._ts}` }
    get requiredFieldName()   { return `AUTOTEST Required Field ${this._ts}` }
    get missingFieldsName()   { return `AUTOTEST Missing Fields ${this._ts}` }
    get descriptionText()     { return `AUTOTEST Description ${this._ts}` }
    get overviewText()        { return `AUTOTEST Overview ${this._ts}` }

    // ── Input fields ──────────────────────────────────────────────────────────

    get caseNameInput() {
        return $('[data-testid="case-info-card-name-input"]')
    }

    get caseTypeCombobox() {
        return $('[data-testid="case-type-combobox"]')
    }

    get caseStatusCombobox() {
        return $('[data-testid="case-status-combobox"]')
    }

    get descriptionInput() {
        return $('[data-testid="case-info-card-short-description-input"]')
    }

    get overviewInput() {
        return $('[data-testid="case-info-card-overview-input"]')
    }

    get noteInput() {
        return $('[data-testid="case-note-input"]')
    }

    get retainedDateInput() {
        return $('input[name="retainedDate"]')
    }

    get retainedByCombobox() {
        return $('[data-testid="party-combobox"]')
    }

    // ── Buttons ───────────────────────────────────────────────────────────────

    get createButton() {
        return $('[data-testid="add-case-create-button"]')
    }

    // Scoped by parent card to disambiguate identical data-testid values
    get assignCaseButton() {
        return $('[data-testid="case-assigned-to-card"] [data-testid="link-button-"]')
    }

    get addAffiliatedPartyButton() {
        return $('[data-testid="case-affiliated-parties-card"] [data-testid="link-button-"]')
    }

    get addEventButton() {
        return $('[data-testid="case-events-add-event-btn"]')
    }

    get billedHourlySwitch() {
        return $('[data-testid="case-info-card-fixed-fee-switch"]')
    }

    get assignCaseSubmitButton() {
        return $('[data-testid="select-users-dialog-submit"]')
    }

    get addPartySubmitButton() {
        return $('[data-testid="affiliated-party-dialog-add-party-button"]')
    }

    // ── Dynamic elements ──────────────────────────────────────────────────────

    // Dropdown options — only present when a combobox is open
    get dropdownOptions() {
        return $$('[role="option"]')
    }

    // First dropdown option — used to wait for the list to appear
    get firstDropdownOption() {
        return $('[role="option"]')
    }

    // Modal/dialog that opens when Assign Case / Add Affiliated Party / Add Event is clicked
    get dialog() {
        return $('[role="dialog"]')
    }

    // Checkboxes inside the open dialog (user list or contact list)
    get dialogCheckboxes() {
        return $$('[role="dialog"] .fui-Checkbox__input')
    }

    // MessageBar that appears when Create is clicked with missing required fields
    get missingFieldsError() {
        return $('.fui-MessageBar')
    }

    // Calendar day button — only present when the date picker dialog is open
    calendarDayButton(dayLabel) {
        return $(`button[aria-label*="${dayLabel}"]`)
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    navigateToNewCase() {
        return super.navigateTo('case/new')
    }

    // ── Input helpers ─────────────────────────────────────────────────────────

    async typeCaseName(text) {
        await this.caseNameInput.setValue(text)
        return this.caseNameInput.getValue()
    }

    async typeNote(text) {
        await this.noteInput.setValue(text)
        return this.noteInput.getValue()
    }

    async typeOverview(text) {
        await this.overviewInput.setValue(text)
        return this.overviewInput.getValue()
    }

    async typeDescription(text) {
        await this.descriptionInput.setValue(text)
        return this.descriptionInput.getValue()
    }

    async getDropdownOptionCount() {
        const options = await this.dropdownOptions
        return options.length
    }

    // ── Combobox helpers ──────────────────────────────────────────────────────

    async openCaseTypeDropdown() {
        await this.caseTypeCombobox.click()
        await this.firstDropdownOption.waitForDisplayed()
    }

    async openCaseStatusDropdown() {
        await this.caseStatusCombobox.click()
        await this.firstDropdownOption.waitForDisplayed()
    }

    async _selectFirstOption() {
        const options = await this.dropdownOptions
        const text = await options[0].getText()
        await options[0].click()
        return text
    }

    async selectFirstCaseType() {
        await this.openCaseTypeDropdown()
        return this._selectFirstOption()
    }

    async selectFirstCaseStatus() {
        await this.openCaseStatusDropdown()
        return this._selectFirstOption()
    }

    // ── Create flow helpers ───────────────────────────────────────────────────

    // Types text character-by-character using W3C Actions to trigger React state
    async fillCaseName(text) {
        await this.caseNameInput.click()
        for (const char of text) {
            await browser.action('key').down(char).up(char).perform()
        }
    }

    // Clicks the date input, waits for the calendar, then clicks today's date
    async selectTodayRetainedDate() {
        await this.retainedDateInput.click()
        await this.dialog.waitForDisplayed()
        const today = new Date()
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const dayLabel = `${today.getDate()}, ${months[today.getMonth()]}`
        await this.calendarDayButton(dayLabel).click()
    }

    // Clicks the Retained By combobox, waits for clients to load, selects by name
    async selectRetainedBy(clientName) {
        await this.retainedByCombobox.scrollIntoView()
        await this.retainedByCombobox.click()
        await browser.waitUntil(
            async () => {
                const opts = await this.dropdownOptions
                if (opts.length === 0) return false
                const firstText = await opts[0].getText()
                return !firstText.toLowerCase().includes('click here')
            },
            { timeout: 8000, interval: 500 }
        )
        const options = await this.dropdownOptions
        for (const opt of options) {
            if ((await opt.getText()).includes(clientName)) {
                await opt.click()
                return
            }
        }
        throw new Error(`Client "${clientName}" not found in Retained By options`)
    }

    async toggleBilledHourly() {
        await this.billedHourlySwitch.click()
    }

    // Opens a dialog, waits for checkboxes to load, clicks the first, and confirms.
    // useJsClick=true bypasses Persona overlay interception via browser.execute
    async _selectFirstInDialog(openBtn, submitBtn, useJsClick = false) {
        await openBtn.click()
        await this.dialog.waitForDisplayed()
        await browser.waitUntil(
            async () => (await this.dialogCheckboxes).length > 0,
            { timeout: 10000, interval: 500 }
        )
        const firstCheckbox = (await this.dialogCheckboxes)[0]
        if (useJsClick) {
            await browser.execute((el) => el.click(), firstCheckbox)
        } else {
            await firstCheckbox.click()
        }
        await submitBtn.click()
        await this.dialog.waitForDisplayed({ reverse: true, timeout: 5000 })
    }

    async assignFirstUser() {
        await this._selectFirstInDialog(this.assignCaseButton, this.assignCaseSubmitButton)
    }

    // Persona overlay obscures the checkbox — _selectFirstInDialog uses JS click to bypass
    async addFirstAffiliatedParty() {
        await this._selectFirstInDialog(this.addAffiliatedPartyButton, this.addPartySubmitButton, true)
    }

    async clickCreate() {
        await this.createButton.click()
    }

    async waitForCreation() {
        await browser.waitUntil(
            async () => !(await browser.getUrl()).includes('/case/new'),
            { timeout: 10000 }
        )
    }
}

export default new NewCase()
