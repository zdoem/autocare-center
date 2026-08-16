import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectError, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Spare', () => {
    test('GET /api/master/spare — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/spare')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/spare — should create with valid data', async ({ request }) => {
        const cats = await apiGet(request, '/api/master/spares-category')
        const catId = getList(cats)[0]?.id
        if (!catId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/spare', {
            name: `อะไหล่ API ${id}`,
            sparesCategoryId: catId,
            unit: 'ชิ้น',
            costPrice: 500,
            sellingPrice: 850,
            minStock: 5,
            maxStock: 50,
            currentStock: 20,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('POST /api/master/spare — should reject missing name', async ({ request }) => {
        const res = await apiPost(request, '/api/master/spare', {
            unit: 'ชิ้น',
        })
        expectError(res, 400)
    })

    test('GET /api/master/spare/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/spare')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/spare/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/spare/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/spare')
        const target = getList(list).find((s: any) => s.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const cats = await apiGet(request, '/api/master/spares-category')
        const catId = getList(cats)[0]?.id

        const res = await apiPut(request, `/api/master/spare/${target.id}`, {
            name: target.name,
            sparesCategoryId: catId || target.sparesCategoryId,
            unit: 'อัน',
            costPrice: 600,
            sellingPrice: 950,
            minStock: 3,
            maxStock: 100,
            isActive: true,
        })
        expectSuccess(res)
    })
})
