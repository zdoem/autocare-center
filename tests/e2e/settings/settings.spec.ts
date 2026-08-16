import { test, expect } from '@playwright/test'

test.describe('Settings Module', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings')
    })

    test('should load settings page with tab navigation', async ({ page }) => {
        await expect(page.locator('.page-title').first()).toContainText(/ตั้งค่า/)
        await expect(page.locator('.list-group-item, .nav-link').first()).toBeVisible()
    })

    test('should switch between tabs', async ({ page }) => {
        await page.click('button:has-text("ภาษี"), a:has-text("ภาษี")')
        await expect(page.locator('text=VAT').first()).toBeVisible()

        await page.click('button:has-text("การแจ้งเตือน"), a:has-text("การแจ้งเตือน")')
        await expect(page.locator('text=SMS').first()).toBeVisible()

        await page.click('button:has-text("พิมพ์เอกสาร"), a:has-text("พิมพ์เอกสาร")')
        await expect(page.locator('text=รูปแบบใบเสร็จ').first()).toBeVisible()

        await page.click('button:has-text("สำรองข้อมูล"), a:has-text("สำรองข้อมูล")')
        await expect(page.locator('text=สำรองอัตโนมัติ').first()).toBeVisible()
    })
})
