import { test, expect } from '@playwright/test'
import { apiGet, uid, expectDataArray } from '../../fixtures/api-helpers'

test.describe('API: Ops - Search', () => {
    test('GET /api/ops/search — should return car list (no query)', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search')
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.pagination).toBeDefined()
    })

    test('GET /api/ops/search?q= — should search by license plate', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search', { q: 'กก' })
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    test('GET /api/ops/search?q= — should search by customer name', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search', { q: 'สมชาย' })
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    test('GET /api/ops/search?q= — should search by phone', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search', { q: '081' })
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    test('GET /api/ops/search?status= — should filter by in-service', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search', { status: 'in-service' })
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    test('GET /api/ops/search?status= — should filter by pending', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search', { status: 'pending' })
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    test('GET /api/ops/search — should include pagination metadata', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search', { page: '1', limit: '5' })
        expect(res.status).toBe(200)
        expect(res.body.pagination.page).toBe(1)
        expect(res.body.pagination.limit).toBe(5)
        expect(res.body.pagination.total).toBeDefined()
    })

    test('GET /api/ops/search — should include car relations', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/search')
        if (res.body.data.length === 0) return test.skip()

        const car = res.body.data[0]
        // Each car should have customer, brand, model relations
        expect(car.customer).toBeDefined()
        expect(car.carBrand).toBeDefined()
    })
})
