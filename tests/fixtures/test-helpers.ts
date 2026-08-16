import { Page, expect } from '@playwright/test'

/**
 * Wait for a success toast (react-hot-toast or SweetAlert2)
 */
export async function waitForSuccessToast(page: Page, timeout = 5000) {
    const toast = page.locator('.react-hot-toast, [class*="toast"], .swal2-popup.swal2-icon-success, .go3958317564')
    await toast.first().waitFor({ state: 'visible', timeout })
}

/**
 * Wait for SweetAlert2 to appear and click confirm
 */
export async function confirmSwalDelete(page: Page) {
    const swal = page.locator('.swal2-popup')
    await swal.waitFor({ state: 'visible', timeout: 5000 })
    await page.click('.swal2-confirm')
    // Wait for the success swal or for it to disappear
    await page.waitForTimeout(1000)
}

/**
 * Wait for SweetAlert2 success popup and click OK
 */
export async function dismissSwalSuccess(page: Page) {
    try {
        const swal = page.locator('.swal2-popup')
        if (await swal.isVisible()) {
            const okBtn = page.locator('.swal2-confirm')
            if (await okBtn.isVisible()) {
                await okBtn.click()
            }
        }
    } catch { /* no swal visible, continue */ }
    await page.waitForTimeout(500)
}

/**
 * Wait for a modal to be fully visible
 */
export async function waitForModal(page: Page, timeout = 5000) {
    await page.locator('.modal.show, .modal.d-block, .modal-backdrop').first().waitFor({ state: 'visible', timeout })
    await page.waitForTimeout(300) // animation settle
}

/**
 * Wait for modal to close
 */
export async function waitForModalClose(page: Page, timeout = 5000) {
    await page.locator('.modal.show, .modal.d-block').waitFor({ state: 'hidden', timeout })
    await page.waitForTimeout(300)
}

/**
 * Fill a form field by label text
 */
export async function fillByLabel(page: Page, labelText: string, value: string) {
    const label = page.locator(`label:has-text("${labelText}")`)
    const fieldId = await label.getAttribute('for')
    if (fieldId) {
        await page.fill(`#${fieldId}`, value)
    } else {
        // Try finding input near the label
        const container = label.locator('..')
        const input = container.locator('input, textarea, select')
        await input.fill(value)
    }
}

/**
 * Select an option from a <select> by visible text
 */
export async function selectByLabel(page: Page, labelText: string, optionText: string) {
    const label = page.locator(`label:has-text("${labelText}")`)
    const container = label.locator('..')
    const select = container.locator('select')
    await select.selectOption({ label: optionText })
}

/**
 * Get the count of rows in a table body
 */
export async function getTableRowCount(page: Page): Promise<number> {
    const rows = page.locator('table tbody tr')
    return await rows.count()
}

/**
 * Login as a specific role (for tests needing non-admin auth)
 */
export async function loginAs(page: Page, username: string, password: string = 'admin123') {
    await page.goto('/login')
    await page.fill('input[type="text"], input[name="username"], input[placeholder*="ชื่อผู้ใช้"], input[placeholder*="username"], input[placeholder*="อีเมล"]', username)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 15000 })
}
