import { test, expect } from '@playwright/test'

test.describe('Cash - Payment Workflow', () => {
    test('should display pending payments page', async ({ page }) => {
        await page.goto('/cash/pending')
        await expect(page.locator('.page-body .card').first()).toBeVisible()
    })

    test('should redirect /cash/payment without jobId to /cash/pending', async ({ page }) => {
        await page.goto('/cash/payment')
        await expect(page).toHaveURL(/\/cash\/pending/, { timeout: 15000 })
    })
})
