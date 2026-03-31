import { browser } from '@wdio/globals'

export default class BasePage {
    navigateTo(path) {
        return browser.url(`/${path}`)
    }
}
