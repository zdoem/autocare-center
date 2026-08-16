import { test, expect } from '@playwright/test'
import { apiGet, apiPost, uid, expectSuccess, expectError } from '../../fixtures/api-helpers'

test.describe('API: Cash - Payment', () => {
    test('POST /api/cash/payment — should reject missing serviceJobId', async ({ request }) => {
        const res = await apiPost(request, '/api/cash/payment', {
            paymentTypeId: 'some-id',
            amount: 1000,
        })
        expectError(res, 400)
    })

    test('POST /api/cash/payment — should reject missing paymentTypeId', async ({ request }) => {
        const res = await apiPost(request, '/api/cash/payment', {
            serviceJobId: 'some-id',
            amount: 1000,
        })
        expectError(res, 400)
    })

    test('POST /api/cash/payment — should reject zero/negative amount', async ({ request }) => {
        const res = await apiPost(request, '/api/cash/payment', {
            serviceJobId: 'some-id',
            paymentTypeId: 'some-id',
            amount: 0,
        })
        expectError(res, 400)
    })

    test('POST /api/cash/payment — should reject non-existent job', async ({ request }) => {
        const paymentTypes = await apiGet(request, '/api/cash/payment-types')
        const ptId = paymentTypes.body.data?.[0]?.id || paymentTypes.body[0]?.id
        if (!ptId) return test.skip()

        const res = await apiPost(request, '/api/cash/payment', {
            serviceJobId: 'nonexistent-job-id-12345',
            paymentTypeId: ptId,
            amount: 1000,
        })
        expectError(res, 404)
    })

    test('GET /api/cash/payment-types — should return payment types list', async ({ request }) => {
        const res = await apiGet(request, '/api/cash/payment-types')
        expect(res.status).toBe(200)
        // Response could be { data: [...] } or direct array
        const data = res.body.data || res.body
        expect(Array.isArray(data)).toBe(true)
    })

    test('POST /api/cash/payment — full payment flow (create job → pay)', async ({ request }) => {
        // 1. Get prerequisites
        const [cars, paymentTypes] = await Promise.all([
            apiGet(request, '/api/master/car'),
            apiGet(request, '/api/cash/payment-types'),
        ])
        const car = cars.body.data[0]
        const ptData = paymentTypes.body.data || paymentTypes.body
        const paymentType = ptData[0]
        if (!car || !paymentType) return test.skip()

        // 2. Create a new job
        const jobRes = await apiPost(request, '/api/ops/job', {
            carId: car.id,
            customerId: car.customerId,
            mileage: 60000,
            customerRequest: `ทดสอบชำระเงิน API ${uid()}`,
            priority: 'NORMAL',
        })
        if (jobRes.status !== 201) return test.skip()
        const jobId = jobRes.body.data.id
        const grandTotal = Number(jobRes.body.data.grandTotal) || 1000

        // 3. Process payment
        const payRes = await apiPost(request, '/api/cash/payment', {
            serviceJobId: jobId,
            paymentTypeId: paymentType.id,
            amount: grandTotal > 0 ? grandTotal : 1000,
            notes: `ชำระ API test ${uid()}`,
        })
        expectSuccess(payRes, 201)
        expect(payRes.body.data.payment).toBeDefined()
        expect(payRes.body.data.receipt).toBeDefined()
        expect(payRes.body.data.payment.paymentNo).toContain('PAY-')
        expect(payRes.body.data.receipt.receiptNo).toContain('RCT-')

        // 4. Verify job is now paid
        const updatedJob = await apiGet(request, `/api/ops/job/${jobId}`)
        expect(updatedJob.body.data.isPaid).toBe(true)
        expect(updatedJob.body.data.status).toBe('COMPLETED')
    })

    test('POST /api/cash/payment — should reject already-paid job', async ({ request }) => {
        // Find a paid job
        const jobs = await apiGet(request, '/api/ops/job')
        const paidJob = jobs.body.data.find((j: any) => j.isPaid === true)
        if (!paidJob) return test.skip()

        const ptRes = await apiGet(request, '/api/cash/payment-types')
        const ptData = ptRes.body.data || ptRes.body
        const ptId = ptData[0]?.id
        if (!ptId) return test.skip()

        const res = await apiPost(request, '/api/cash/payment', {
            serviceJobId: paidJob.id,
            paymentTypeId: ptId,
            amount: 1000,
        })
        expectError(res, 400)
    })
})
