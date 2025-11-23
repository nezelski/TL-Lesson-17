import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/ar'
import { PASSWORD, USERNAME } from '../../config/env-data'

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
    await expect(authPage.errorMessagePopup).toContainText('Incorrect credentials');
})

test('TL-17-5 login with correct credentials and verify order creation page', async ({}) => {
    const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
    await expect(orderCreationPage.statusButton).toBeVisible()
    await orderCreationPage.checkInnerComponentsVisible()
})

test('TL-17-6  login and create order', async ({page}) => {
    const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
    await orderCreationPage.nameField.fill('test')
    await orderCreationPage.phoneField.fill('test123')
    await orderCreationPage.commentField.fill('ergergerg')
    await (orderCreationPage.checkOrderCreationPopupVisible(false))
    await orderCreationPage.orderCreationButton.click()
    await page.waitForTimeout(1000)
    await (orderCreationPage.checkOrderCreationPopupVisible(true))
})

test('TL-17-7  logging out from order page', async () => {
    const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
    await orderCreationPage.checkInnerComponentsVisible()
    await orderCreationPage.logoutButton.click()
    await expect (authPage.signInButton).toBeVisible()
})
