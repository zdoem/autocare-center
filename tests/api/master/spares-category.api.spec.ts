import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Spares Category', () => {
    test('GET /api/master/spares-category — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/spares-category')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/spares-category — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/spares-category', {
            name: `หมวดอะไหล่ API ${id}`,
            description: `ทดสอบ API ${id}`,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('GET /api/master/spares-category/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/spares-category')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/spares-category/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/spares-category/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/spares-category')
        const target = getList(list).find((s: any) => s.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/spares-category/${target.id}`, {
            name: target.name,
            description: `อัปเดตแล้ว ${uid()}`,
            isActive: true,
        })
        expectSuccess(res)
    })
})
