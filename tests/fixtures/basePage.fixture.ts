import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page'
import { PASSWORD, USERNAME } from '../../config/env-data'

type extendedTest = {
  loginPage: LoginPage
  orderPage: OrderPage
  foundPage: FoundPage
  auth: { jwt: string }
  orderId: string
  deliveredStatus: string
}

export const test = base.extend<extendedTest>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },
  orderPage: async ({ page }, use) => {
    const orderPage = new OrderPage(page)
    await use(orderPage)
  },

  foundPage: async ({ page }, use) => {
    const foundPage = new FoundPage(page)
    await use(foundPage)
  },

  auth: async ({ request }, use) => {
    const response = await request.post('https://backend.tallinn-learning.ee/login/student', {
      data: {
        username: USERNAME,
        password: PASSWORD,
      },
    })
    const jwt = await response.text()

    await use({ jwt })
  },

  orderId: async ({ auth, request }, use) => {
    const response = await request.post('https://backend.tallinn-learning.ee/orders', {
      data: {
        status: 'OPEN',
        customerName: 'testName',
        customerPhone: 'testPhone',
        comment: 'testComment',
      },
      headers: {
        Authorization: `Bearer ${auth.jwt}`,
        'content-type': 'application/json',
      },
    })

    const responseData = await response.json()
    const orderId = responseData.id
    await use(String(orderId))
  },

  deliveredStatus: async ({ page, orderId }, use) => {
    await page.route('**/orders/*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          status: 'DELIVERED',
          courierId: null,
          customerName: 'customerName',
          customerPhone: 'customerPhone',
          comment: 'comment',
          id: Number(orderId),
        },
      })
    })

    await use('DELIVERED')
  },
})
