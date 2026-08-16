import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, apiDelete, uid, expectSuccess, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Vendor', () => {
    test('GET /api/master/vendor — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/vendor')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/vendor — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/vendor', {
            name: `ผู้จัดจำหน่าย API ${id}`,
            contactName: `คุณ API ${id}`,
            phone: `02${id}9999`,
            email: `vendor${id}@test.com`,
            address: '88/8 ถนนทดสอบ',
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('GET /api/master/vendor/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/vendor')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/vendor/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/vendor/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/vendor')
        const target = getList(list).find((v: any) => v.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/vendor/${target.id}`, {
            name: target.name,
            contactName: `อัปเดต ${uid()}`,
            phone: target.phone || '029998877',
            isActive: true,
        })
        expectSuccess(res)
    })
})
