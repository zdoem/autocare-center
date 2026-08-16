import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'

test.describe('Master Data - Department', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/department')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display department list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/แผนก/)
    })

    test('should create a new department', async ({ page }) => {
        const data = TEST_DATA.department
        
        await page.click('button:has-text("เพิ่มแผนก"), button:has-text("เพิ่ม")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(data.name)
        
        await page.click('.modal button:has-text("บันทึก")')
        
        await expect(page.locator(`text=${data.name}`).first()).toBeVisible({ timeout: 15000 })
    })
})
