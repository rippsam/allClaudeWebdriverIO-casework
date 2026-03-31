import { $ } from '@wdio/globals'
import BasePage from './basePage.js'

class DashboardPage extends BasePage {
    get navDashboard() {
        return $('[data-testid="vert-nav-dashboard"]')
    }

    navigateToDashboard() {
        return super.navigateTo('')
    }
}

export default new DashboardPage()
