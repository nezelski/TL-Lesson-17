import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/ar'
import { PASSWORD, SERVICE_URL, USERNAME } from '../../config/env-data'
import NotFoundPage from '../pages/not-found-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page'

let authPage: LoginPage

test.beforeEach(async ({ page }) => {
  authPage = new LoginPage(page)
  await authPage.open()
})

test('TL-17-3  signIn button disabled when incorrect data inserted', async ({}) => {
  await authPage.usernameField.fill(faker.lorem.word(2))
  await authPage.passwordField.fill(faker.lorem.word(7))
  await expect(authPage.signInButton).toBeDisabled()
})

test('TL-17-4  error message displayed when incorrect credentials used', async ({}) => {
  await authPage.usernameField.fill(faker.lorem.word(7))
  await authPage.passwordField.fill(faker.lorem.word(8))
  await expect(authPage.signInButton).toBeEnabled()
  await authPage.signInButton.click()
  await expect(authPage.errorMessagePopup).toBeVisible()
  await expect(authPage.errorMessagePopup).toContainText('Incorrect credentials')
})

test('TL-17-5 login with correct credentials and verify order creation page', async ({}) => {
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await expect(orderCreationPage.statusButton).toBeVisible()
  await orderCreationPage.checkInnerComponentsVisible()
})

test('TL-17-6  login and create order and check order found pag e', async ({ page }) => {
  const foundPage = new FoundPage(page)
  const orderInfo = {
    name: 'order',
    phoneField: '45645467',
    comment: 'comment',
  }
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.nameField.fill(orderInfo.name)
  await orderCreationPage.phoneField.fill(orderInfo.phoneField)
  await orderCreationPage.commentField.fill(orderInfo.comment)
  await orderCreationPage.checkOrderCreationPopupVisible(false)
  await orderCreationPage.orderCreationButton.click()
  await page.waitForTimeout(1000)
  await orderCreationPage.checkOrderCreationPopupVisible(true)
  const orderId = await orderCreationPage.getOrderIdPopup()
  await orderCreationPage.closeCreatioPopup()
  await orderCreationPage.findOrderById(orderId)
  await foundPage.checkElementVisibility(foundPage.orderName)
})

test('TL-17-7  logging out from order page', async () => {
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.checkInnerComponentsVisible()
  await orderCreationPage.logoutButton.click()
  await expect(authPage.signInButton).toBeVisible()
})

test('TL-18-1 check not found page', async ({ page }) => {
  const notFoundPage = new NotFoundPage(page, `${SERVICE_URL}/orders/-1`)
  const orderPage = new OrderPage(page, 'url')

  await authPage.signIn(USERNAME, PASSWORD)
  await orderPage.findOrderById(-1)
  await notFoundPage.checkElementVisibility(notFoundPage.title)
  await notFoundPage.checkElementVisibility(notFoundPage.description)
})
