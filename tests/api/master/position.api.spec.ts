import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectDataArray, expectDataObject } from '../../fixtures/api-helpers'

test.describe('API: Master - Position', () => {
    test('GET /api/master/position — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/position')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/master/position — should create', async ({ request }) => {
        // Get a department to link to
        const depts = await apiGet(request, '/api/master/department')
        const deptId = depts.body.data[0]?.id
        if (!deptId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/position', {
            name: `ตำแหน่ง API ${id}`,
            departmentId: deptId,
            description: `ทดสอบ API ${id}`,
            baseSalary: 25000,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(res.body.data.name).toContain(id)
    })

    test('GET /api/master/position/:id — should return single', async ({ request }) => {
        const list = await apiGet(request, '/api/master/position')
        const firstId = list.body.data[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/position/${firstId}`)
        expectSuccess(res)
        expectDataObject(res)
    })

    test('PUT /api/master/position/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/position')
        const target = list.body.data.find((d: any) => d.name?.includes('API'))
        if (!target) return test.skip()

        const depts = await apiGet(request, '/api/master/department')
        const deptId = depts.body.data[0]?.id

        const res = await apiPut(request, `/api/master/position/${target.id}`, {
            name: target.name,
            departmentId: deptId,
            description: `อัปเดตแล้ว ${uid()}`,
            isActive: true,
        })
        expectSuccess(res)
    })
})
