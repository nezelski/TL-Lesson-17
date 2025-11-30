import type { Locator, Page } from '@playwright/test'
import { OrderPage } from './order-page'
import { SERVICE_URL } from '../../config/env-data'
import BasePage from './base-page'

export class LoginPage extends BasePage {
  readonly url: string = SERVICE_URL
  readonly signInButton: Locator
  readonly usernameField: Locator
  readonly passwordField: Locator
  readonly errorMessagePopup: Locator
  // add more locators here

  constructor(page: Page) {
    super(page, `${SERVICE_URL}/signin`)
    this.signInButton = page.getByTestId('signIn-button')
    this.usernameField = page.getByTestId('username-input')
    this.passwordField = page.getByTestId('password-input')
    this.errorMessagePopup = page.getByTestId('authorizationError-popup')
  }

  async open() {
    await this.page.goto(this.url)
  }

  async signIn(username: string, password: string) {
    await this.fillElement(this.usernameField, username)
    await this.fillElement(this.passwordField, password)
    await this.clickElement(this.signInButton)

    return new OrderPage(this.page, this.url)
  }
}
