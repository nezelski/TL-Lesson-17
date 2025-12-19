import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page';
import {SERVICE_URL} from '../../config/env-data';

const jwt = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyb21hbm5qaiIsImV4cCI6MTc2NTkwMTgyOCwiaWF0IjoxNzY1ODgzODI4fQ.dCjYn_X1a8cTbCb8H2ce9oCMilmrN5ATLQ5eeDytfbUHzoA8UL8rwjXveIePlcVN3zgRkOv6EIoCR0IpnOSEWA'


test('TL-22-1  signIn with mocks', async ({page }) => {
    const loginPage = new LoginPage(page)
    const orderPage = new OrderPage(page, SERVICE_URL);
    await loginPage.mockAuth();
    await loginPage.open();
    await loginPage.usernameField.fill('test');
    await loginPage.passwordField.fill('test1234');
    await loginPage.signInButton.click();
    await orderPage.checkElementVisibility(orderPage.trackButton);
})

test('TL-22-2  create and find order with mocks', async ({context }) => {
    const newOrder = {
        status: 'OPEN',
        courierId: null,
        customerName: 'testName',
        customerPhone: 'testPhone',
        comment: 'testComment',
        id: 100
    }

    await context.addInitScript((token)=>{
        localStorage.setItem('jwt',token)
    },jwt);
    const page = await context.newPage();

    const loginPage = new LoginPage(page)
    const orderPage = new OrderPage(page, SERVICE_URL);
    const foundPage = new FoundPage(page);
    await loginPage.mockAuth();
    await loginPage.open();
    await loginPage.usernameField.fill('test');
    await loginPage.passwordField.fill('test1234');
    await loginPage.signInButton.click();
    await orderPage.nameField.fill(newOrder.customerName);
    await orderPage.phoneField.fill(newOrder.customerPhone);
    await orderPage.commentField.fill(newOrder.comment);
    await page.route('**/orders', async route => {
        await route.fulfill({
             status: 200,
             json: newOrder
        })
    })
    const createOrderResponse = page.waitForResponse('**/orders');
    await orderPage.orderCreationButton.click();
    await createOrderResponse;

    await orderPage.checkOrderCreationPopupVisible();
    expect(await orderPage.getOrderIdPopup()).toBe(newOrder.id);
    await orderPage.okButton.click();
    await orderPage.statusButton.click();
    await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id));

    await page.route('**/orders/*', async route => {
       await route.fulfill({
            status: 200,
            json: newOrder
       })
    })
    const findOrderResponse = page.waitForResponse('**/orders/*');
    await orderPage.trackButton.click();
    await findOrderResponse
    expect (await foundPage.orderName.innerText()).toBe(newOrder.customerName);
})


