import { $ } from '@wdio/globals'
import Base from './base.js'

class Login extends Base {
    get usernameField() {
        return $('input[name="username"]')
    }

    get passwordField() {
        return $('input[name="password"]')
    }

    get signInButton() {
        return $('[data-testid="login-submit"]')
    }

    async signIn(username, password) {
        await this.usernameField.waitForDisplayed({ timeout: 15000 })
        await this.usernameField.setValue(username)
        await this.passwordField.setValue(password)
        await this.signInButton.waitForClickable()
        await this.signInButton.click()
    }

    navigateToLoginPage() {
        return super.navigateTo('')
    }
}

export default new Login()
