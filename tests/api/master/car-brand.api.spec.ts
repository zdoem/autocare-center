import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectDataArray, expectDataObject } from '../../fixtures/api-helpers'

test.describe('API: Master - Car Brand', () => {
    test('GET /api/master/car-brand — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/car-brand')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/master/car-brand — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/car-brand', {
            name: `ยี่ห้อ API ${id}`,
            nameThai: `ไทย ${id}`,
            nameEnglish: `Brand ${id}`,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(res.body.data.name).toContain(id)
    })

    test('GET /api/master/car-brand/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/car-brand')
        const firstId = list.body.data[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/car-brand/${firstId}`)
        expectSuccess(res)
        expectDataObject(res)
    })

    test('PUT /api/master/car-brand/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/car-brand')
        const target = list.body.data.find((b: any) => b.name?.includes('API'))
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/car-brand/${target.id}`, {
            name: target.name,
            nameThai: `อัปเดต ${uid()}`,
            nameEnglish: target.nameEnglish,
            isActive: true,
        })
        expectSuccess(res)
    })
})
