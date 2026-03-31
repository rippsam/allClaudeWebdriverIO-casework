import { expect, browser } from '@wdio/globals'
import DashboardPage from '../pageobjects/dashboard.js'

describe('Login', () => {
    it('should authenticate and land on the dashboard', async () => {
        await browser.url('/')
        await expect(DashboardPage.navDashboard).toBeDisplayed()
    })
})
