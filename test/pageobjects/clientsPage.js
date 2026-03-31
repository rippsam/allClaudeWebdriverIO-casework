import { $, browser } from '@wdio/globals'
import BasePage from './basePage.js'

class ClientsPage extends BasePage {
    get createButton() {
        return $('[data-testid="parties-create-button"]')
    }

    get nameInput() {
        return $('[data-testid="party-dialog-name-input"]')
    }

    get dialogCreateButton() {
        return $('[data-testid="party-dialog-create-button"]')
    }

    get searchInput() {
        return $('[data-testid="search-input"]')
    }

    navigateToClientsPage() {
        return super.navigateTo('account/clientsParties')
    }

    async ensureClientExists(name) {
        await this.navigateToClientsPage()
        await this.createButton.waitForDisplayed({ timeout: 10000 })

        // Wait for list to render and check if client already exists
        await browser.waitUntil(async () => true, { timeout: 1500 }).catch(() => null)
        const pageText = await browser.execute(() => document.body.innerText)
        if (pageText.includes(name)) return

        // Client not found — create it
        await this.createButton.click()
        await this.nameInput.waitForDisplayed({ timeout: 5000 })
        await this.nameInput.setValue(name)
        await this.dialogCreateButton.click()
        await this.dialogCreateButton.waitForDisplayed({ timeout: 5000, reverse: true })
    }
}

export default new ClientsPage()
