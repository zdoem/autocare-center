import { test, expect } from '@playwright/test'

test.describe('Operations - Service Job Workflow', () => {
    test('should list existing service jobs / search jobs', async ({ page }) => {
        await page.goto('/ops/search')
        await page.waitForLoadState('domcontentloaded')
        await expect(page.locator('.page-title').first()).toContainText(/ค้นหา|รับรถ/)
        await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 })
    })

    test('should load car receive / job creation page', async ({ page }) => {
        await page.goto('/ops/receive')
        await page.waitForLoadState('domcontentloaded')
        await expect(page.locator('.page-title').first()).toContainText(/รับรถ|ใบรับรถ/)
        await expect(page.locator('.page-body').first()).toBeVisible({ timeout: 15000 })
    })
})
