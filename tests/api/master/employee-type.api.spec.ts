import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectDataArray, expectDataObject } from '../../fixtures/api-helpers'

test.describe('API: Master - Employee Type', () => {
    test('GET /api/master/employee-type — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/employee-type')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/master/employee-type — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/employee-type', {
            name: `ประเภทพนักงาน API ${id}`,
            description: `ทดสอบ API ${id}`,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(res.body.data.name).toContain(id)
    })

    test('GET /api/master/employee-type/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/employee-type')
        const firstId = list.body.data[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/employee-type/${firstId}`)
        expectSuccess(res)
        expectDataObject(res)
    })
})
