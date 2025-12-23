import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page';
import NotFoundPage from '../pages/not-found-page';
import {SERVICE_URL} from "../../config/env-data";


const jwt = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyb21hbm5qaiIsImV4cCI6MTc2NTkwMTgyOCwiaWF0IjoxNzY1ODgzODI4fQ.dCjYn_X1a8cTbCb8H2ce9oCMilmrN5ATLQ5eeDytfbUHzoA8UL8rwjXveIePlcVN3zgRkOv6EIoCR0IpnOSEWA'


test('TL-22-1  signIn with mocks', async ({page }) => {
    const loginPage = new LoginPage(page)
    const orderPage = new OrderPage(page);
    await loginPage.mockAuth();
    await loginPage.open();
    await loginPage.usernameField.fill('test');
    await loginPage.passwordField.fill('test1234');
    await loginPage.signInButton.click();
    await orderPage.checkElementVisibility(orderPage.statusButton);
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
    const orderPage = new OrderPage(page);
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

test('TL-22-3  Find order with status OPEN using mocks', async ({context}) => {

    const newOrder = {
        status: 'OPEN',
        courierId: null,
        customerName: 'testName',
        customerPhone: 'testPhone',
        comment: 'testComment',
        id: 100
    }
    await context.addInitScript((token) => {
        localStorage.setItem('jwt', token)
    }, jwt)
    const page = await context.newPage()
    const orderPage = new OrderPage(page);
    const foundPage = new FoundPage(page)

    await orderPage.open();

    await page.route('**/orders/*', async (route) => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                json: newOrder,
            })
        } else {
            await route.continue()
        }

        await orderPage.statusButton.click();
        await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id));

        const trackOrderResponse = page.waitForResponse('**/orders/*');
        await orderPage.trackButton.click();
        await trackOrderResponse;

        expect(await foundPage.getStatusActive()).toBe('OPEN');
    })
})

test('TL-22-4  Find order with status DELIVERED using mocks', async ({context}) => {
    const order = {
        status: 'DELIVERED',
        courierId: null,
        customerName: 'testName',
        customerPhone: 'testPhone',
        comment: 'testComment',
        id: 100
    }
    await context.addInitScript((token) => {
        localStorage.setItem('jwt', token)
    }, jwt)
    const page = await context.newPage()
    const orderPage = new OrderPage(page);
    const foundPage = new FoundPage(page)

    await orderPage.open();

    await page.route('**/orders/*', async (route) => {
        if (route.request().method() === 'POST') {
            await route.fulfill({
                status: 200,
                json: order,
            })
        } else {
            await route.continue()
        }
        await orderPage.statusButton.click();
        await orderPage.fillElement(orderPage.orderIdInputField, String(order.id));

        const trackOrderResponse = page.waitForResponse('**/orders/*');
        await orderPage.trackButton.click();
        await trackOrderResponse;

        expect(await foundPage.getStatusActive()).toBe('DELIVERED');
    })
})

test('TL-22-5  order not found flow with mock', async ({context}) => {
    const orderId = -1;

    await context.addInitScript((token) => {
        localStorage.setItem('jwt', token)
    }, jwt)
    const page = await context.newPage()
    const orderPage = new OrderPage(page);
    const notFoundPage = new NotFoundPage(page)

    await page.route('**/orders/*', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
            })
        } else {
            await route.continue()
        }
        await orderPage.open();
        await orderPage.statusButton.click();
        await orderPage.fillElement(orderPage.orderIdInputField, String(orderId));

        const trackOrderResponse = page.waitForResponse('**/orders/*');
        await orderPage.trackButton.click();
        await trackOrderResponse;

        await expect(notFoundPage.title).toBeVisible();
        await expect(notFoundPage.title).toHaveText('Order not found');
    })
})

test('TL-22-6 service error with status 500', async ({context}) => {
    const newOrder = {
        status: 'OPEN',
        courierId: null,
        customerName: 'testName',
        customerPhone: 'testPhone',
        comment: 'testComment',
        id: 100
    };
    await context.addInitScript((token) => {
        localStorage.setItem('jwt', token)
    }, jwt)
    const page = await context.newPage();
    const orderPage = new OrderPage(page);
    const notFoundPage = new NotFoundPage(page);

    await orderPage.open();

    await orderPage.statusButton.click({force: true});
    await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id));

    await page.route('**/orders/*', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 500,
            })
        }
    })

    await expect(orderPage.trackButton).toBeVisible();
    await expect(orderPage.trackButton).toBeEnabled();

    const trackOrderResponse = page.waitForResponse('**/orders/*');
    await orderPage.trackButton.click({force: true});
    await trackOrderResponse;

    await expect(notFoundPage.title).toBeVisible()
    await expect(notFoundPage.title).toHaveText('Order not found')
})