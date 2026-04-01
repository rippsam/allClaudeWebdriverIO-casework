import { browser } from '@wdio/globals'

export default class Base {
    navigateTo(path) {
        return browser.url(`/${path}`)
    }
}
