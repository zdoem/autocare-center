import { test, expect } from '@playwright/test'
import { dismissSwalSuccess } from '../../fixtures/test-helpers'

test.describe('Master Data - Car Model', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/car-model')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display car model list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/รุ่น/)
    })

    test('should create a new car model', async ({ page }) => {
        const modelName = `รุ่นทดสอบ ${Date.now().toString().slice(-5)}`
        
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 })
        
        await page.click('button:has-text("เพิ่มรุ่นรถ"), button:has-text("เพิ่มรุ่น"), button:has-text("เพิ่ม")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        await page.waitForFunction(() => {
            const sel = document.querySelector('.modal select') as HTMLSelectElement
            return Boolean(sel && sel.options && sel.options.length > 1 && sel.options[1].value !== '')
        }, { timeout: 15000 })

        const brandId = await page.evaluate(() => {
            const sel = document.querySelector('.modal select') as HTMLSelectElement
            return sel.options[1].value
        })

        const select = page.locator('.modal select').first()
        await select.selectOption(brandId)
        await select.dispatchEvent('change')

        const nameInput = page.locator('.modal input.form-control').first()
        await nameInput.fill(modelName)
        await nameInput.dispatchEvent('input')
        await nameInput.dispatchEvent('change')
        await page.waitForTimeout(300)
        
        await page.click('.modal button:has-text("บันทึก")')
        
        await dismissSwalSuccess(page)
        await page.waitForTimeout(500)
        
        await expect(page.locator('.table, .card-table').first()).toContainText(modelName, { timeout: 15000 })
    })
})
