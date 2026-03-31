import { $ } from '@wdio/globals'
import BasePage from './basePage.js'

class LoginPage extends BasePage {
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
        await this.usernameField.setValue(username)
        await this.passwordField.setValue(password)
        await this.signInButton.click()
    }

    navigateToLoginPage() {
        return super.navigateTo('')
    }
}

export default new LoginPage()
