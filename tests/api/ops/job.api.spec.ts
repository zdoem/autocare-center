import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectDataArray, expectDataObject, expectError } from '../../fixtures/api-helpers'

test.describe('API: Ops - Service Job', () => {
    let createdJobId: string

    test('GET /api/ops/job — should return paginated list', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/job')
        expectSuccess(res)
        expectDataArray(res)
        // Check pagination fields
        expect(res.body.total).toBeDefined()
        expect(res.body.page).toBeDefined()
    })

    test('GET /api/ops/job?status= — should filter by status', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/job', { status: 'COMPLETED' })
        expectSuccess(res)
        expectDataArray(res)
    })

    test('GET /api/ops/job?search= — should search by jobNo/plate/phone', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/job', { search: 'JOB' })
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/ops/job — should create new service job', async ({ request }) => {
        // Get a car (which is linked to a customer)
        const cars = await apiGet(request, '/api/master/car')
        const car = cars.body.data[0]
        if (!car) return test.skip()

        const res = await apiPost(request, '/api/ops/job', {
            carId: car.id,
            customerId: car.customerId,
            mileage: 50000,
            customerRequest: `ทดสอบ API ${uid()}`,
            priority: 'NORMAL',
        })
        expectSuccess(res, 201)
        expect(res.body.data.jobNo).toBeDefined()
        expect(res.body.data.jobNo).toContain('JOB-')
        createdJobId = res.body.data.id
    })

    test('POST /api/ops/job — should reject missing carId', async ({ request }) => {
        const res = await apiPost(request, '/api/ops/job', {
            mileage: 10000,
        })
        expectError(res, 400)
    })

    test('GET /api/ops/job/:id — should return single job with relations', async ({ request }) => {
        const list = await apiGet(request, '/api/ops/job')
        const firstId = list.body.data[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/ops/job/${firstId}`)
        expectSuccess(res)
        expectDataObject(res)
        // Should include car, customer, items relations
        expect(res.body.data.car).toBeDefined()
    })

    test('PUT /api/ops/job/:id — should update status', async ({ request }) => {
        const list = await apiGet(request, '/api/ops/job')
        const job = list.body.data.find((j: any) =>
            j.status === 'RECEIVED' || j.status === 'INSPECTION'
        )
        if (!job) return test.skip()

        const res = await apiPut(request, `/api/ops/job/${job.id}`, {
            status: 'IN_PROGRESS',
            notes: `อัปเดตสถานะ API ${uid()}`,
        })
        expectSuccess(res)
        expect(res.body.data.status).toBe('IN_PROGRESS')
    })

    test('GET /api/ops/job/:id — should return 404 for invalid id', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/job/nonexistent-id-12345')
        expectError(res, 404)
    })
})
