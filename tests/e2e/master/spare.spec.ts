import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'
import { dismissSwalSuccess } from '../../fixtures/test-helpers'

test.describe('Master Data - Spare', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/spare')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display spare parts list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/อะไหล่/)
    })

    test('should create a new spare part', async ({ page }) => {
        const data = TEST_DATA.spare
        
        await page.click('button:has-text("เพิ่ม"), button:has-text("สร้าง")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const selects = page.locator('.modal select')
        if (await selects.count() > 0) {
            await selects.first().selectOption({ index: 1 }).catch(() => {})
        }

        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(data.name)
        
        await page.click('.modal button:has-text("บันทึก")')
        await dismissSwalSuccess(page)
        
        await expect(page.locator(`text=${data.name}`).first()).toBeVisible({ timeout: 15000 })
    })
})
