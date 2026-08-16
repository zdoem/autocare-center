import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'
import { dismissSwalSuccess } from '../../fixtures/test-helpers'

test.describe('Master Data - Car', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/car')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display car list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/รถยนต์/)
    })

    test('should create a new car', async ({ page }) => {
        const uid = Date.now().toString().slice(-5)
        const licensePlate = `9กข${uid}`
        
        await page.click('button:has-text("เพิ่ม"), button:has-text("สร้าง")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(licensePlate)

        // Select Brand, Model, and Customer using Playwright native selectOption
        const selects = page.locator('.modal select')
        const brandSelect = selects.nth(0)
        const modelSelect = selects.nth(1)
        const custSelect = selects.nth(2)

        // Wait for Brand select options to be populated
        await expect(brandSelect.locator('option').nth(1)).toBeAttached({ timeout: 10000 })
        
        // Loop through brand options until model select is enabled and has options
        const brandOptionsCount = await brandSelect.locator('option').count()
        for (let i = 1; i < brandOptionsCount; i++) {
            await brandSelect.selectOption({ index: i }).catch(() => {})
            await brandSelect.dispatchEvent('change')
            await page.waitForTimeout(400)
            
            const isDisabled = await modelSelect.getAttribute('disabled')
            const modelOptionsCount = await modelSelect.locator('option').count()
            if (isDisabled === null && modelOptionsCount > 1) {
                break
            }
        }

        // Select model (index 1)
        await modelSelect.selectOption({ index: 1 }).catch(() => {})
        await modelSelect.dispatchEvent('change')
        await page.waitForTimeout(200)

        // Select customer (index 1)
        await custSelect.selectOption({ index: 1 }).catch(() => {})
        await custSelect.dispatchEvent('change')
        await page.waitForTimeout(200)
        
        await page.click('.modal button:has-text("บันทึก")')
        await dismissSwalSuccess(page)
        
        await expect(page.locator(`text=${licensePlate}`).first()).toBeVisible({ timeout: 15000 })
    })
})
