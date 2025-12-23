import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { SERVICE_URL } from '../../config/env-data'
import BasePage from './base-page'

export class OrderPage extends BasePage {
  readonly statusButton: Locator
  readonly nameField: Locator
  readonly commentField: Locator
  readonly phoneField: Locator
  readonly orderCreationButton: Locator

  readonly orderCreationSuccessPopup: Locator
  readonly okButton: Locator
  readonly codeSpan: Locator

  readonly logoutButton: Locator
  readonly searchOrderPopup: Locator
  readonly orderIdInputField: Locator
  readonly trackButton: Locator

  constructor(page: Page, url: string) {
    super(page, url ? url : SERVICE_URL)
    this.statusButton = page.getByTestId('openStatusPopup-button')
    this.nameField = page.getByTestId('username-input')
    this.commentField = page.getByTestId('comment-input')
    this.phoneField = page.getByTestId('phone-input')
    this.orderCreationButton = page.getByTestId('createOrder-button')

    this.orderCreationSuccessPopup = page.locator('main > .popup')
    this.okButton = this.orderCreationSuccessPopup.getByTestId(
      'orderSuccessfullyCreated-popup-ok-button',
    )
    this.codeSpan = this.orderCreationSuccessPopup.locator('.notification-popup__text').nth(1)

    this.logoutButton = page.getByTestId('logout-button')
    this.searchOrderPopup = page.getByTestId('searchOrder-popup')
    this.orderIdInputField = this.searchOrderPopup.getByTestId('searchOrder-input')
    this.trackButton = this.searchOrderPopup.getByTestId('searchOrder-submitButton')
  }

  async checkInnerComponentsVisible(): Promise<void> {
    await this.checkElementVisibility(this.statusButton)
    await this.checkElementEnabled(this.statusButton)
    await this.checkElementVisibility(this.nameField)
    await this.checkElementVisibility(this.commentField)
    await this.checkElementVisibility(this.phoneField)
    await this.checkElementVisibility(this.orderCreationButton)
    await this.checkElementVisibility(this.logoutButton)
  }

  async checkOrderCreationPopupVisible(visible = true): Promise<void> {
    expect(await this.orderCreationSuccessPopup.getAttribute('class')).toContain(
      visible ? 'popup_opened' : 'undefined',
    )
  }

  async findOrderById(id: number): Promise<void> {
    await test.step(`Search order by ID:'${id}'`, async (): Promise<void> => {
      await this.clickElement(this.statusButton)
      await this.fillElement(this.orderIdInputField, String(id))
      await this.clickElement(this.trackButton)
    })
  }

  async closeCreatioPopup(): Promise<void> {
    await test.step('Close popup after order creation', async (): Promise<void> => {
      await this.clickElement(this.okButton)
    })
  }

  async getOrderIdPopup(): Promise<number> {
    const text = await this.codeSpan.innerText()
    const strArray = text.split(' ')

    return Number(strArray[strArray.length - 1])
  }
}
