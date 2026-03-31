import { browser } from '@wdio/globals'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import LoginPage from '../pageobjects/login.js'
import DashboardPage from '../pageobjects/dashboard.js'

const TOKEN_FILE = '.auth-tokens.json'

async function saveSessionTokens() {
    const tokens = await browser.execute(() => {
        const items = {}
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            items[key] = localStorage.getItem(key)
        }
        return items
    })
    writeFileSync(TOKEN_FILE, JSON.stringify(tokens))
}

async function injectSessionTokens(tokens) {
    await browser.url('https://app.thecasework.com/')
    await browser.execute((t) => {
        Object.entries(t).forEach(([key, value]) => localStorage.setItem(key, value))
    }, tokens)
    await browser.refresh()
    await DashboardPage.navDashboard.waitForDisplayed({ timeout: 10000, interval: 500 })
}

export async function ensureAuthenticated() {
    if (existsSync(TOKEN_FILE)) {
        try {
            const tokens = JSON.parse(readFileSync(TOKEN_FILE, 'utf8'))
            await injectSessionTokens(tokens)
            if (await DashboardPage.navDashboard.isDisplayed()) return
        } catch (e) {
            // tokens expired, fall through to full sign in
        }
    }
    await LoginPage.navigateToLoginPage()
    await LoginPage.signIn(process.env.TEST_EMAIL, process.env.TEST_PASSWORD)
    await DashboardPage.navDashboard.waitForDisplayed({ timeout: 15000, interval: 500 })
    await saveSessionTokens()
}
