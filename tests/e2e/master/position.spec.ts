import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'
import { dismissSwalSuccess } from '../../fixtures/test-helpers'

test.describe('Master Data - Position', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/position')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display position list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/ตำแหน่ง/)
    })

    test('should create a new position', async ({ page }) => {
        const data = TEST_DATA.position
        
        await page.click('button:has-text("เพิ่มตำแหน่ง"), button:has-text("เพิ่ม")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(data.name)

        const select = page.locator('.modal select').first()
        if (await select.isVisible()) {
            await select.selectOption({ index: 1 }).catch(() => {})
            await select.dispatchEvent('change')
        }
        
        await page.click('.modal button:has-text("บันทึก")')
        await dismissSwalSuccess(page)
        
        await expect(page.locator(`text=${data.name}`).first()).toBeVisible({ timeout: 15000 })
    })
})
