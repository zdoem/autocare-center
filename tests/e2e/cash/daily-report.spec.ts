import { test, expect } from '@playwright/test'

test.describe('Cash - Daily Report', () => {
    test('should load cash daily report with date filter and summary', async ({ page }) => {
        await page.goto('/cash/daily')
        await expect(page.locator('.page-title').first()).toContainText(/รายงาน/i)
        await expect(page.locator('input[type="date"]').first()).toBeVisible()
    })
})
