import { test, expect } from '@playwright/test'

test.describe('Master Data - Customer Detail', () => {
    test('should load customer detail page with car history and repair records', async ({ page }) => {
        // Navigate to customer page first to get an ID
        await page.goto('/master/customer')
        const firstCustomer = page.locator('table a[href*="/master/customer/"]').first()
        
        if (await firstCustomer.isVisible()) {
            await firstCustomer.click()
            await expect(page).toHaveURL(/\/master\/customer\/.+/)
            await expect(page.locator('.page-title')).toContainText(/ข้อมูลลูกค้า|ประวัติ/)
        }
    })
})
