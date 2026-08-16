import { test, expect } from '@playwright/test'

test.describe('Dashboard Module', () => {
    test('Admin dashboard loads with navbar and content', async ({ page }) => {
        await page.goto('/dashboard')
        await expect(page.locator('.page-wrapper')).toBeVisible()
        await expect(page.locator('h2, .page-title').first()).toContainText(/Dashboard|ภาพรวม/i)
    })

    test('Cashier dashboard loads correctly', async ({ page }) => {
        await page.goto('/dashboard/cashier')
        await expect(page.locator('.page-title, h2')).toBeVisible()
    })

    test('Technician dashboard loads correctly', async ({ page }) => {
        await page.goto('/dashboard/technician')
        await expect(page.locator('.page-title, h2')).toBeVisible()
    })
})
