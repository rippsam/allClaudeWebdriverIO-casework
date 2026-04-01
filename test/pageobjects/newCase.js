import { $, $$, browser } from '@wdio/globals'
import BasePage from './basePage.js'

class NewCasePage extends BasePage {
    // ── Test data ─────────────────────────────────────────────────────────────
    get XSS_PAYLOAD() { return "<script>alert('xss')</script>" }
    get SQL_PAYLOAD() { return "' OR '1'='1" }
    get CREATE_MIN_NAME() { return 'AUTOTEST Create Min' }
    get CREATE_ALL_FIELDS_NAME() { return 'AUTOTEST Create All Fields' }
    get RETAINED_BY_CLIENT() { return 'AUTOTEST Client' }
    get DELETE_HOVER_NAME() { return 'AUTOTEST Delete Hover' }
    get DELETE_MENU_NAME() { return 'AUTOTEST Delete ThreeDots' }

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

    // ── Dynamic elements ──────────────────────────────────────────────────────

    // Dropdown options — only present when a combobox is open
    get dropdownOptions() {
        return $$('[role="option"]')
    }

    // Modal/dialog that opens when Assign Case / Add Affiliated Party / Add Event is clicked
    get dialog() {
        return $('[role="dialog"]')
    }

    // MessageBar that appears when Create is clicked with missing required fields
    get missingFieldsError() {
        return $('.fui-MessageBar')
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
        await $('[role="option"]').waitForDisplayed()
    }

    async openCaseStatusDropdown() {
        await this.caseStatusCombobox.click()
        await $('[role="option"]').waitForDisplayed()
    }

    async selectFirstCaseType() {
        await this.openCaseTypeDropdown()
        const options = await this.dropdownOptions
        const text = await options[0].getText()
        await options[0].click()
        return text
    }

    async selectFirstCaseStatus() {
        await this.openCaseStatusDropdown()
        const options = await this.dropdownOptions
        const text = await options[0].getText()
        await options[0].click()
        return text
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
        await $('[role="dialog"]').waitForDisplayed()
        const today = new Date()
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const dayLabel = `${today.getDate()}, ${months[today.getMonth()]}`
        await $(`button[aria-label*="${dayLabel}"]`).click()
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

export default new NewCasePage()
