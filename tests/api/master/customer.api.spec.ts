import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectError, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Customer', () => {
    test('GET /api/master/customer — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/customer')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/customer — should create with valid data', async ({ request }) => {
        const types = await apiGet(request, '/api/master/customer-type')
        const typeId = getList(types)[0]?.id
        if (!typeId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/customer', {
            firstName: `ลูกค้า ${id}`,
            lastName: 'API',
            phone: `089-123-${id.slice(-4).padStart(4, '0')}`,
            email: `cust${id}@test.com`,
            address: '99/9 ถนนทดสอบ',
            customerTypeId: typeId,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).firstName).toContain(id)
    })

    test('POST /api/master/customer — should reject missing firstName', async ({ request }) => {
        const res = await apiPost(request, '/api/master/customer', {
            lastName: 'Test',
        })
        expectError(res, 400)
    })

    test('GET /api/master/customer/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/customer')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/customer/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/customer/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/customer')
        const target = getList(list).find((c: any) => c.firstName?.includes('API') || c.lastName?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/customer/${target.id}`, {
            firstName: target.firstName,
            lastName: `อัปเดต ${uid()}`,
            phone: target.phone || '089-123-4567',
            customerTypeId: target.customerTypeId,
            isActive: true,
        })
        expectSuccess(res)
    })
})
