import { browser } from '@wdio/globals'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import Login from '../pageobjects/login.js'
import Dashboard from '../pageobjects/dashboard.js'

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
    await Dashboard.navDashboard.waitForDisplayed({ timeout: 10000, interval: 500 })
}

export async function ensureAuthenticated() {
    if (existsSync(TOKEN_FILE)) {
        try {
            const tokens = JSON.parse(readFileSync(TOKEN_FILE, 'utf8'))
            await injectSessionTokens(tokens)
            if (await Dashboard.navDashboard.isDisplayed()) return
        } catch (e) {
            // tokens expired, fall through to full sign in
        }
    }
    await Login.navigateToLoginPage()
    await Login.signIn(process.env.TEST_EMAIL, process.env.TEST_PASSWORD)
    await Dashboard.navDashboard.waitForDisplayed({ timeout: 15000, interval: 500 })
    await saveSessionTokens()
}
