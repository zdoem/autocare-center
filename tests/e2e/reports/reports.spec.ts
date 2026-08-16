import { test, expect } from '@playwright/test'

const reportPages = [
    { path: '/reports/daily', title: /รายวัน|Daily/i },
    { path: '/reports/monthly', title: /รายเดือน|Monthly/i },
    { path: '/reports/service', title: /บริการ|Service/i },
    { path: '/reports/stock', title: /สต๊อก|Stock/i },
    { path: '/reports/technician', title: /ช่าง|Technician/i },
    { path: '/reports/customer', title: /ลูกค้า|Customer/i },
    { path: '/reports/top-customer', title: /Top|ลูกค้า/i },
    { path: '/reports/jobs-today', title: /วันนี้|Jobs/i },
    { path: '/reports/expense', title: /ค่าใช้จ่าย|Expense/i },
    { path: '/reports/payment', title: /ชำระเงิน|Payment/i },
    { path: '/reports/purchase', title: /สั่งซื้อ|Purchase/i },
    { path: '/reports/followup', title: /Follow-up|เซอร์วิส/i },
    { path: '/reports/repeat-customer', title: /Repeat|กลับมาใช้บริการ/i },
]

test.describe('Reports Module', () => {
    for (const report of reportPages) {
        test(`should load ${report.path} page cleanly`, async ({ page }) => {
            await page.goto(report.path)
            await expect(page.locator('.page-title').first()).toContainText(report.title)
        })
    }
})
