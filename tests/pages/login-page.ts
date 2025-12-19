import type { Locator, Page } from '@playwright/test'
import { OrderPage } from './order-page'
import { SERVICE_URL } from '../../config/env-data'
import BasePage from './base-page'

const jwt = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyb21hbm5qaiIsImV4cCI6MTc2NTkwMTgyOCwiaWF0IjoxNzY1ODgzODI4fQ.dCjYn_X1a8cTbCb8H2ce9oCMilmrN5ATLQ5eeDytfbUHzoA8UL8rwjXveIePlcVN3zgRkOv6EIoCR0IpnOSEWA'


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

  async mockAuth(): Promise<void> {
      await this.page.route('**/login/student', async route=> {
          await route.fulfill({
              status: 200,
              body: jwt,
          })
      })
  }
}
