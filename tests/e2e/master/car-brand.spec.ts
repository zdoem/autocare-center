import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'

test.describe('Master Data - Car Brand', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/car-brand')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display car brand list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/ยี่ห้อ/)
    })

    test('should create a new car brand', async ({ page }) => {
        const data = TEST_DATA.carBrand
        
        await page.click('button:has-text("เพิ่มยี่ห้อ")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(data.nameThai)
        await inputs.nth(1).fill(data.nameEnglish)
        
        await page.click('.modal button:has-text("บันทึก")')
        
        await expect(page.locator(`text=${data.nameThai}`).first()).toBeVisible({ timeout: 15000 })
    })
})
