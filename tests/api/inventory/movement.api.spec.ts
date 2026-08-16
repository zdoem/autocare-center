import { test, expect } from '@playwright/test'
import { apiGet, expectSuccess, getList } from '../../fixtures/api-helpers'

test.describe('API: Inventory - Stock Movement', () => {
    test('GET /api/inventory/movement — should return movements list', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/movement')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('GET /api/inventory/movement?movementType=IN — should filter by type', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/movement', { movementType: 'IN' })
        expectSuccess(res)
        const list = getList(res)
        for (const m of list) {
            expect(m.movementType).toBe('IN')
        }
    })

    test('GET /api/inventory/movement?spareId= — should filter by spare', async ({ request }) => {
        const spares = await apiGet(request, '/api/master/spare')
        const spareId = getList(spares)[0]?.id
        if (!spareId) return test.skip()

        const res = await apiGet(request, '/api/inventory/movement', { spareId })
        expectSuccess(res)
        const list = getList(res)
        for (const m of list) {
            expect(m.spareId).toBe(spareId)
        }
    })

    test('GET /api/inventory/movement?limit= — should respect limit', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/movement', { limit: '3' })
        expectSuccess(res)
        expect(getList(res).length).toBeLessThanOrEqual(3)
    })

    test('GET /api/inventory/movement — should include spare details', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/movement')
        const list = getList(res)
        if (list.length === 0) return test.skip()

        const movement = list[0]
        expect(movement.spare).toBeDefined()
        expect(movement.spare.name).toBeDefined()
    })
})
