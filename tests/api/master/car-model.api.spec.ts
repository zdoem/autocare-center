import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectDataArray, expectDataObject } from '../../fixtures/api-helpers'

test.describe('API: Master - Car Model', () => {
    test('GET /api/master/car-model — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/car-model')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/master/car-model — should create', async ({ request }) => {
        // Get a car brand to link to
        const brands = await apiGet(request, '/api/master/car-brand')
        const brandId = brands.body.data[0]?.id
        if (!brandId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/car-model', {
            name: `รุ่น API ${id}`,
            carBrandId: brandId,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(res.body.data.name).toContain(id)
    })

    test('GET /api/master/car-model/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/car-model')
        const firstId = list.body.data[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/car-model/${firstId}`)
        expectSuccess(res)
        expectDataObject(res)
    })

    test('PUT /api/master/car-model/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/car-model')
        const target = list.body.data.find((m: any) => m.name?.includes('API'))
        if (!target) return test.skip()

        const brands = await apiGet(request, '/api/master/car-brand')
        const brandId = brands.body.data[0]?.id

        const res = await apiPut(request, `/api/master/car-model/${target.id}`, {
            name: target.name,
            carBrandId: brandId,
            isActive: true,
        })
        expectSuccess(res)
    })
})
