import { $ } from '@wdio/globals'
import Base from './base.js'

class Dashboard extends Base {
    get navDashboard() {
        return $('[data-testid="vert-nav-dashboard"]')
    }

    navigateToDashboard() {
        return super.navigateTo('')
    }
}

export default new Dashboard()
