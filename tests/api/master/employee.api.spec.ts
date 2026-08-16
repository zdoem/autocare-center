import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectError, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Employee', () => {
    test('GET /api/master/employee — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/employee')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/master/employee — should create with valid data', async ({ request }) => {
        const [depts, positions, types] = await Promise.all([
            apiGet(request, '/api/master/department'),
            apiGet(request, '/api/master/position'),
            apiGet(request, '/api/master/employee-type'),
        ])

        const deptId = getList(depts)[0]?.id
        const posId = getList(positions)[0]?.id
        const typeId = getList(types)[0]?.id
        if (!deptId || !posId || !typeId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/employee', {
            name: `พนักงาน API ${id}`,
            nickname: 'เทส',
            phone: '081-234-5678',
            email: `emp${id}@test.com`,
            departmentId: deptId,
            positionId: posId,
            employeeTypeId: typeId,
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(getItem(res).name).toContain(id)
    })

    test('POST /api/master/employee — should reject missing name', async ({ request }) => {
        const res = await apiPost(request, '/api/master/employee', {
            nickname: 'Test',
        })
        expectError(res, 400)
    })

    test('GET /api/master/employee/:id — should return single with relations', async ({ request }) => {
        const list = await apiGet(request, '/api/master/employee')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/employee/${firstId}`)
        expectSuccess(res)
        expect(getItem(res).id).toBeDefined()
    })

    test('PUT /api/master/employee/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/employee')
        const target = getList(list).find((e: any) => e.name?.includes('API')) || getList(list)[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/employee/${target.id}`, {
            name: target.name || 'พนักงาน ทดสอบ',
            nickname: target.nickname || 'เทส',
            phone: target.phone || '081-234-5678',
            departmentId: target.departmentId,
            positionId: target.positionId,
            employeeTypeId: target.employeeTypeId,
            isActive: true,
        })
        expectSuccess(res)
    })
})
