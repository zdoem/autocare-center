import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Payment Type', () => {
    test('GET /api/master/payment-type — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/payment-type')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/payment-type — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/payment-type', {
            name: `วิธีชำระ API ${id}`,
            description: `ทดสอบ API ${id}`,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('GET /api/master/payment-type/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/payment-type')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/payment-type/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/payment-type/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/payment-type')
        const target = getList(list).find((p: any) => p.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/payment-type/${target.id}`, {
            name: target.name,
            description: `อัปเดตแล้ว ${uid()}`,
            isActive: true,
        })
        expectSuccess(res)
    })
})
