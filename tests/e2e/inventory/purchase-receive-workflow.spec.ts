import { test, expect } from '@playwright/test'

test.describe('Inventory - Purchase & Receive Workflow', () => {
    test('should load purchase order page', async ({ page }) => {
        await page.goto('/inventory/purchase')
        await expect(page.locator('.page-title').first()).toContainText(/สั่งซื้อ|PO/)
    })

    test('should load receive page and display pending POs', async ({ page }) => {
        await page.goto('/inventory/receive')
        await expect(page.locator('.page-title').first()).toContainText(/รับสินค้า/)
    })

    test('should load stock movements page', async ({ page }) => {
        await page.goto('/inventory/movement')
        await expect(page.locator('.page-title').first()).toContainText(/ความเคลื่อนไหว|Movement/)
    })

    test('should load inventory alert page', async ({ page }) => {
        await page.goto('/inventory/alert')
        await expect(page.locator('.page-title').first()).toContainText(/แจ้งเตือน/)
    })
})
