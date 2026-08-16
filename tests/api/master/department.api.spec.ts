import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, apiDelete, uid, expectSuccess, expectDataArray, expectDataObject, expectError } from '../../fixtures/api-helpers'

test.describe('API: Master - Department', () => {
    let createdId: string

    test('GET /api/master/department — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/department')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/master/department — should create', async ({ request }) => {
        const id = uid()
        const res = await apiPost(request, '/api/master/department', {
            name: `แผนก API ${id}`,
            description: `ทดสอบ API ${id}`,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(res.body.data.name).toContain(id)
        createdId = res.body.data.id
    })

    test('GET /api/master/department/:id — should return single', async ({ request }) => {
        // Get first item from list
        const list = await apiGet(request, '/api/master/department')
        const firstId = list.body.data[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/department/${firstId}`)
        expectSuccess(res)
        expectDataObject(res)
    })

    test('PUT /api/master/department/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/department')
        const target = list.body.data.find((d: any) => d.name?.includes('API'))
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/department/${target.id}`, {
            name: target.name,
            description: `อัปเดตแล้ว ${uid()}`,
            isActive: true,
        })
        expectSuccess(res)
    })

    test('GET /api/master/department?search= — should filter', async ({ request }) => {
        const res = await apiGet(request, '/api/master/department', { search: 'ช่าง' })
        expectSuccess(res)
        expectDataArray(res)
    })

    test('DELETE /api/master/department/:id — should delete newly created department', async ({ request }) => {
        const id = uid()
        const created = await apiPost(request, '/api/master/department', {
            name: `แผนก ลบ ${id}`,
            description: `ทดสอบลบ ${id}`,
            isActive: true,
        })
        expectSuccess(created, 201)
        const newId = created.body.data.id

        const res = await apiDelete(request, `/api/master/department/${newId}`)
        expectSuccess(res)

        const getRes = await apiGet(request, `/api/master/department/${newId}`)
        expectError(getRes, 404)
    })
})
