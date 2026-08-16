import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Customer Type', () => {
    test('GET /api/master/customer-type — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/customer-type')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/customer-type — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/customer-type', {
            name: `ประเภทลูกค้า API ${id}`,
            description: `ทดสอบ API ${id}`,
            discount: 5,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('GET /api/master/customer-type/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/customer-type')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/customer-type/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/customer-type/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/customer-type')
        const target = getList(list).find((c: any) => c.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/customer-type/${target.id}`, {
            name: target.name,
            description: `อัปเดตแล้ว ${uid()}`,
            discount: 10,
            isActive: true,
        })
        expectSuccess(res)
    })
})
