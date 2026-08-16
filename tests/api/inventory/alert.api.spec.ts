import { test, expect } from '@playwright/test'
import { apiGet, expectSuccess, expectDataArray } from '../../fixtures/api-helpers'

test.describe('API: Inventory - Alert (Low Stock)', () => {
    test('GET /api/inventory/alert — should return low-stock spares', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/alert')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('GET /api/inventory/alert — results should have stock flags', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/alert')
        expectSuccess(res)

        // Each alert item should have isOutOfStock and isLowStock flags
        for (const item of res.body.data) {
            expect(typeof item.isOutOfStock).toBe('boolean')
            expect(typeof item.isLowStock).toBe('boolean')
            // currentStock should be <= minStock
            expect(item.currentStock).toBeLessThanOrEqual(item.minStock)
        }
    })

    test('GET /api/inventory/alert — should include spare category', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/alert')
        if (res.body.data.length === 0) return test.skip()

        const item = res.body.data[0]
        expect(item.sparesCategory).toBeDefined()
    })
})
