import { test, expect } from '@playwright/test'

test.describe('Operations - Register', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/ops/register')
    })

    test('should load car registration form', async ({ page }) => {
        await expect(page.locator('.page-title').first()).toContainText(/ลงทะเบียน|รับรถ/)
        await expect(page.locator('input').first()).toBeVisible()
    })
})
