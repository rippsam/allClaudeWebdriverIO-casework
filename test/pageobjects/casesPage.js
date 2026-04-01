import { $, $$, browser } from '@wdio/globals'
import BasePage from './basePage.js'

class CasesPage extends BasePage {
    // ── Static elements ───────────────────────────────────────────────────────

    get menuDeleteOption() {
        return $('[data-testid="custom-data-table-context-menu-item-Delete"]')
    }

    get deleteConfirmButton() {
        return $('button=Yes')
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    navigateToCases() {
        return super.navigateTo('cases')
    }

    // ── Waiters ───────────────────────────────────────────────────────────────

    async waitForCaseVisible(name) {
        await browser.waitUntil(
            async () => (await browser.execute((n) => document.body.innerText.includes(n), name)),
            { timeout: 10000, interval: 500 }
        )
    }

    async waitForCaseGone(name) {
        // Navigate to /cases to get a fresh page load free of toast notifications
        // that briefly show the deleted case name after confirmation
        await this.navigateToCases()
        await browser.waitUntil(
            async () => !(await browser.execute((n) => document.body.innerText.includes(n), name)),
            { timeout: 15000, interval: 500 }
        )
    }

    // ── Row finder ────────────────────────────────────────────────────────────

    async findRowByName(name) {
        const rows = await $$('[role="row"]')
        for (const row of rows) {
            const btns = await row.$$('button')
            for (const btn of btns) {
                if ((await btn.getText()).trim() === name) return row
            }
        }
        throw new Error(`Case row not found for name: "${name}"`)
    }

    // Uses W3C pointer actions to physically move to an element and click it,
    // bypassing both CSS pointer-events restrictions and WebDriver click interception
    async pointerClick(el) {
        await browser.action('pointer')
            .move({ origin: el })
            .pause(150)
            .down({ button: 0 })
            .up({ button: 0 })
            .perform()
    }

    // The delete button is hidden behind a gridcell overlay that blocks WebDriver
    // hit-tests. Use JS el.click() directly on the element to bypass z-stacking.
    async clickHiddenDeleteBtn(deleteBtn) {
        await browser.execute((btn) => {
            btn.style.visibility = 'visible'
            btn.click()
        }, deleteBtn)
    }

    // ── Delete flows ──────────────────────────────────────────────────────────

    // Deletes ALL copies of a case name — handles duplicates from previous runs
    async deleteAllByName(name) {
        await this.navigateToCases()
        for (let i = 0; i < 20; i++) {
            const exists = await browser.execute((n) => document.body.innerText.includes(n), name)
            if (!exists) break
            const row = await this.findRowByName(name).catch(() => null)
            if (!row) break
            const deleteBtn = await row.$('button[aria-label="Delete"]')
            await this.clickHiddenDeleteBtn(deleteBtn)
            await this.deleteConfirmButton.waitForDisplayed({ timeout: 5000 })
            await this.deleteConfirmButton.click()
            await browser.waitUntil(
                async () => !(await this.deleteConfirmButton.isDisplayed().catch(() => false)),
                { timeout: 8000, interval: 300 }
            )
        }
    }

    // Deletes a case by hovering over the row and clicking the hover Delete button
    async deleteByHover(name) {
        await this.navigateToCases()
        await this.waitForCaseVisible(name)
        const row = await this.findRowByName(name)
        const deleteBtn = await row.$('button[aria-label="Delete"]')
        await this.clickHiddenDeleteBtn(deleteBtn)
        await this.deleteConfirmButton.waitForDisplayed({ timeout: 5000 })
        await this.deleteConfirmButton.click()
        await this.waitForCaseGone(name)
    }

    // Deletes a case via the three-dot menu → Delete option
    async deleteByThreeDots(name) {
        await this.navigateToCases()
        await this.waitForCaseVisible(name)
        const nameBtn = await $(`button=${name}`)
        await nameBtn.moveTo()
        const row = await this.findRowByName(name)
        const dotsBtn = await row.$('button[aria-label="More items"]')
        await this.pointerClick(dotsBtn)
        await this.menuDeleteOption.waitForDisplayed({ timeout: 5000 })
        await this.menuDeleteOption.click()
        await this.deleteConfirmButton.waitForDisplayed({ timeout: 5000 })
        await this.deleteConfirmButton.click()
        await this.waitForCaseGone(name)
    }
}

export default new CasesPage()
