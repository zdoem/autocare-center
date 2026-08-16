import { test, expect } from '@playwright/test'

test.describe('Auth Module - Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('domcontentloaded')
    })

    test('should show login page with correct UI elements', async ({ page }) => {
        await expect(page.locator('input[placeholder*="username"], input[placeholder*="ชื่อผู้ใช้"], input[placeholder*="อีเมล"], input[name="username"]')).toBeVisible({ timeout: 10000 })
        await expect(page.locator('input[type="password"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should login successfully with admin credentials', async ({ page }) => {
        await page.fill('input[placeholder*="username"], input[placeholder*="ชื่อผู้ใช้"], input[placeholder*="อีเมล"], input[name="username"]', 'admin')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    })

    test('should login successfully with cashier credentials', async ({ page }) => {
        await page.fill('input[placeholder*="username"], input[placeholder*="ชื่อผู้ใช้"], input[placeholder*="อีเมล"], input[name="username"]', 'cashier')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    })

    test('should login successfully with technician credentials', async ({ page }) => {
        await page.fill('input[placeholder*="username"], input[placeholder*="ชื่อผู้ใช้"], input[placeholder*="อีเมล"], input[name="username"]', 'tech')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    })

    test('should show error for wrong password', async ({ page }) => {
        await page.fill('input[placeholder*="username"], input[placeholder*="ชื่อผู้ใช้"], input[placeholder*="อีเมล"], input[name="username"]', 'admin')
        await page.fill('input[type="password"]', 'wrongpassword')
        await page.click('button[type="submit"]')
        await expect(page.locator('.react-hot-toast, [class*="toast"], .alert-danger').or(page.getByText(/ไม่ถูกต้อง|Invalid/i)).first()).toBeVisible({ timeout: 10000 })
    })

    test('should redirect unauthenticated user from protected route to login', async ({ page }) => {
        await page.goto('/master/customer')
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
    })
})
