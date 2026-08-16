import { test, expect } from '@playwright/test'

test.describe('Inventory - Stock', () => {
    test('should display stock list table with levels', async ({ page }) => {
        await page.goto('/inventory/stock')
        await expect(page.locator('.page-title').first()).toContainText(/Stock|สต๊อก|สินค้าคงเหลือ/i)
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
    })
})
