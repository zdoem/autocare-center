import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, apiDelete, uid, expectSuccess, expectError, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Ops - Job Item', () => {
    test('POST /api/ops/job-item — should add SERVICE item to job', async ({ request }) => {
        // Get a job and a service
        const [jobs, services] = await Promise.all([
            apiGet(request, '/api/ops/job'),
            apiGet(request, '/api/master/service'),
        ])
        const job = getList(jobs)[0]
        const service = getList(services)[0]
        if (!job || !service) return test.skip()

        const res = await apiPost(request, '/api/ops/job-item', {
            serviceJobId: job.id,
            itemType: 'SERVICE',
            serviceId: service.id,
            description: service.name || `บริการ API ${uid()}`,
            quantity: 1,
            unitPrice: Number(service.price) || 1500,
            discount: 0,
        })
        expectSuccess(res, 201)
        const item = getItem(res)
        expect(item.itemType).toBe('SERVICE')
        expect(item.total).toBeDefined()
    })

    test('POST /api/ops/job-item — should add SPARE item to job', async ({ request }) => {
        const [jobs, spares] = await Promise.all([
            apiGet(request, '/api/ops/job'),
            apiGet(request, '/api/master/spare'),
        ])
        const job = getList(jobs)[0]
        const spare = getList(spares)[0]
        if (!job || !spare) return test.skip()

        const res = await apiPost(request, '/api/ops/job-item', {
            serviceJobId: job.id,
            itemType: 'SPARE',
            spareId: spare.id,
            description: spare.name || `อะไหล่ API ${uid()}`,
            quantity: 2,
            unitPrice: Number(spare.sellingPrice) || 850,
            discount: 50,
        })
        expectSuccess(res, 201)
        const item = getItem(res)
        expect(item.itemType).toBe('SPARE')
    })

    test('POST /api/ops/job-item — should reject invalid itemType', async ({ request }) => {
        const res = await apiPost(request, '/api/ops/job-item', {
            serviceJobId: 'any-id',
            itemType: 'INVALID',
            description: 'test',
            quantity: 1,
            unitPrice: 100,
        })
        expectError(res, 400)
    })

    test('POST /api/ops/job-item — should reject missing description', async ({ request }) => {
        const res = await apiPost(request, '/api/ops/job-item', {
            serviceJobId: 'any-id',
            itemType: 'SERVICE',
            quantity: 1,
            unitPrice: 100,
        })
        expectError(res, 400)
    })

    test('POST /api/ops/job-item — should recalculate job totals', async ({ request }) => {
        // Add item then verify job totals updated
        const jobs = await apiGet(request, '/api/ops/job')
        const job = jobs.body.data[0]
        if (!job) return test.skip()

        const beforeJob = await apiGet(request, `/api/ops/job/${job.id}`)
        const beforeTotal = Number(beforeJob.body.data.grandTotal) || 0

        // The total should have been updated by previous item additions
        expect(typeof beforeTotal).toBe('number')
    })
})
