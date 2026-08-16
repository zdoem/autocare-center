import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'

test.describe('Master Data - Customer Type', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/customer-type')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display customer type list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/ประเภทลูกค้า/)
    })

    test('should create a new customer type', async ({ page }) => {
        const data = TEST_DATA.customerType
        
        await page.click('button:has-text("เพิ่ม"), button:has-text("สร้าง")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(data.name)
        
        await page.click('.modal button:has-text("บันทึก")')
        
        await expect(page.locator(`text=${data.name}`).first()).toBeVisible({ timeout: 15000 })
    })
})
