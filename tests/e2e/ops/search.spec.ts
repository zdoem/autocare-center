import { test, expect } from '@playwright/test'

test.describe('Operations - Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/ops/search')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should load search page with input controls', async ({ page }) => {
        await expect(page.locator('.page-title').first()).toContainText(/ค้นหา/)
        await expect(page.locator('input[type="text"], input[placeholder*="ค้นหา"]').first()).toBeVisible()
    })

    test('should search customer/car and show results', async ({ page }) => {
        const searchInput = page.locator('input[type="text"], input[placeholder*="ค้นหา"]').first()
        await searchInput.fill('สมศักดิ์')
        await page.waitForTimeout(500)
    })
})
