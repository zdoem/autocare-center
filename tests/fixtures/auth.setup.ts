import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authDir = path.join(__dirname, '../.auth')
const authFile = path.join(authDir, 'admin.json')

setup('authenticate as admin', async ({ page }) => {
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }

    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    await page.locator('input[type="text"]').first().fill('admin')
    await page.locator('input[type="password"]').first().fill('admin123')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    await page.context().storageState({ path: authFile })
})
