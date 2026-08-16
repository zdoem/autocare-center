import { test, expect } from '@playwright/test'
import { TEST_DATA } from '../../fixtures/test-data'
import { dismissSwalSuccess } from '../../fixtures/test-helpers'

test.describe('Master Data - Customer', () => {
    test.use({ storageState: 'tests/.auth/admin.json' })

    test.beforeEach(async ({ page }) => {
        await page.goto('/master/customer')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should display customer list table', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        await expect(page.locator('.page-title').first()).toContainText(/ลูกค้า/)
    })

    test('should create a new customer', async ({ page }) => {
        const uid = Date.now().toString().slice(-5)
        const firstName = `สมชาย${uid}`
        const lastName = `ทดสอบ${uid}`
        const phone = `08${uid.padStart(8, '0')}`
        
        await page.click('button:has-text("เพิ่ม"), button:has-text("สร้าง")')
        await page.waitForSelector('.modal.show, .modal.d-block', { state: 'visible', timeout: 10000 })
        
        const inputs = page.locator('.modal input.form-control')
        await inputs.nth(0).fill(firstName)
        await inputs.nth(1).fill(lastName)
        await inputs.nth(2).fill(phone)

        const select = page.locator('.modal select').first()
        if (await select.isVisible()) {
            await select.selectOption({ index: 1 }).catch(() => {})
            await select.dispatchEvent('change')
        }
        
        await page.click('.modal button:has-text("บันทึก")')
        await dismissSwalSuccess(page)
        
        await expect(page.locator(`text=${firstName}`).first()).toBeVisible({ timeout: 15000 })
    })

    test('should navigate to customer detail page', async ({ page }) => {
        await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 })
        const detailLink = page.locator('table a[href*="/master/customer/"]').first()
        if (await detailLink.isVisible()) {
            await detailLink.click()
            await expect(page).toHaveURL(/\/master\/customer\/.+/)
        }
    })
})
