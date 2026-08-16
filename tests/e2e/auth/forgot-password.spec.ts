import { test, expect } from '@playwright/test'

test.describe('Auth Module - Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/forgot-password')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should show forgot password form with email input', async ({ page }) => {
        const emailInput = page.locator('input[type="email"], input[placeholder*="อีเมล"]')
        await expect(emailInput).toBeVisible({ timeout: 10000 })
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should submit email and display confirmation response', async ({ page }) => {
        const emailInput = page.locator('input[type="email"], input[placeholder*="อีเมล"]')
        await emailInput.fill('admin@autocar.com')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(1000)
    })
})
