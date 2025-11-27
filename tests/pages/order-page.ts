import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export class OrderPage {
  readonly page: Page
  readonly statusButton: Locator
  readonly nameField: Locator
  readonly commentField: Locator
  readonly phoneField: Locator
  readonly orderCreationButton: Locator
  readonly orderCreationSuccessPopup: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.statusButton = page.getByTestId('openStatusPopup-button')
    this.nameField = page.getByTestId('username-input')
    this.commentField = page.getByTestId('comment-input')
    this.phoneField = page.getByTestId('phone-input')
    this.orderCreationButton = page.getByTestId('createOrder-button')
    this.orderCreationSuccessPopup = page.locator('main > .popup')
    this.logoutButton = page.getByTestId('logout-button')
  }

  async checkInnerComponentsVisible(): Promise<void> {
    await expect(this.statusButton).toBeVisible()
    await expect(this.statusButton).toBeEnabled()
    await expect(this.nameField).toBeVisible()
    await expect(this.commentField).toBeVisible()
    await expect(this.phoneField).toBeVisible()
    await expect(this.orderCreationButton).toBeVisible()
    await expect(this.logoutButton).toBeVisible()
  }

  async checkOrderCreationPopupVisible(visible = true): Promise<void> {
    expect(await this.orderCreationSuccessPopup.getAttribute('class')).toContain(
      visible ? 'popup_opened' : 'undefined',
    )
  }
}
