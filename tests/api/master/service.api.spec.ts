import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Service', () => {
    test('GET /api/master/service — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/service')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/service — should create', async ({ request }) => {
        const cats = await apiGet(request, '/api/master/service-category')
        const catId = getList(cats)[0]?.id
        if (!catId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/service', {
            name: `บริการ API ${id}`,
            serviceCategoryId: catId,
            price: 1500,
            standardTime: 60,
            description: `ทดสอบ API ${id}`,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('GET /api/master/service/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/service')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/service/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/service/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/service')
        const target = getList(list).find((s: any) => s.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const cats = await apiGet(request, '/api/master/service-category')
        const catId = getList(cats)[0]?.id

        const res = await apiPut(request, `/api/master/service/${target.id}`, {
            name: target.name,
            serviceCategoryId: catId || target.serviceCategoryId,
            price: 2000,
            standardTime: 90,
            description: `อัปเดตแล้ว ${uid()}`,
            isActive: true,
        })
        expectSuccess(res)
    })
})
