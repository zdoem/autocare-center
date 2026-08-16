import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'
import { dismissSwalSuccess } from '../../fixtures/test-helpers'

test.describe('Master Data - Employee', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/master/employee')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display employee list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/พนักงาน/)
    })

    test('should create a new employee', async ({ page }) => {
        const uid = Date.now().toString().slice(-5)
        const name = `พนักงานทดสอบ ${uid}`
        const phone = `08${uid.padStart(8, '0')}`
        
        await page.click('button:has-text("เพิ่ม"), button:has-text("สร้าง")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(name)
        
        // Select Department & Position using robust loop
        const deptSelect = page.locator('.modal select').nth(0)
        const posSelect = page.locator('.modal select').nth(1)
        
        await expect(deptSelect.locator('option').nth(1)).toBeAttached({ timeout: 10000 })
        const deptCount = await deptSelect.locator('option').count()

        for (let i = 1; i < deptCount; i++) {
            await deptSelect.selectOption({ index: i }).catch(() => {})
            await deptSelect.dispatchEvent('change')
            await page.waitForTimeout(300)

            const posCount = await posSelect.locator('option').count()
            if (posCount > 1) {
                break
            }
        }

        await posSelect.selectOption({ index: 1 }).catch(() => {})
        await posSelect.dispatchEvent('change')

        // Phone input
        const phoneInput = page.locator('.modal input[placeholder*="0XX"], .modal input[name="phone"], .modal label:has-text("โทรศัพท์") + input, .modal label:has-text("เบอร์โทร") + input')
        if (await phoneInput.isVisible()) {
            await phoneInput.fill(phone)
        } else {
            await inputs.nth(2).fill(phone).catch(() => {})
        }

        await page.click('.modal button:has-text("บันทึก")')
        await dismissSwalSuccess(page)
        
        await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 15000 })
    })
})
