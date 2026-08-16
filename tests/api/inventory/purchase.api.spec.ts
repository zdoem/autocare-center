import { test, expect } from '@playwright/test'
import { apiGet, apiPost, uid, expectSuccess, expectError, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Inventory - Purchase', () => {
    test('GET /api/inventory/purchase — should return purchase list', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/purchase')
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('GET /api/inventory/purchase?status= — should filter by status', async ({ request }) => {
        const res = await apiGet(request, '/api/inventory/purchase', { status: 'RECEIVED' })
        expectSuccess(res)
        expect(Array.isArray(getList(res))).toBe(true)
    })

    test('POST /api/inventory/purchase — should reject missing vendor/items', async ({ request }) => {
        const res = await apiPost(request, '/api/inventory/purchase', {
            vendorId: '',
            items: [],
        })
        expectError(res, 400)
    })

    test('POST /api/inventory/purchase — should create PO (PENDING)', async ({ request }) => {
        const [vendors, spares] = await Promise.all([
            apiGet(request, '/api/master/vendor'),
            apiGet(request, '/api/master/spare'),
        ])
        const vendor = getList(vendors)[0]
        const spare = getList(spares)[0]
        if (!vendor || !spare) return test.skip()

        const res = await apiPost(request, '/api/inventory/purchase', {
            vendorId: vendor.id,
            status: 'PENDING',
            notes: `API test PO ${uid()}`,
            vatRate: 7,
            items: [
                {
                    spareId: spare.id,
                    quantity: 10,
                    unitPrice: Number(spare.costPrice) || 500,
                },
            ],
        })
        expectSuccess(res, 201)
        const po = getItem(res)
        expect(po.purchaseNo).toContain('PO-')
        expect(po.status).toBe('PENDING')
    })

    test('POST /api/inventory/purchase — should create RECEIVED PO and update stock', async ({ request }) => {
        const [vendors, spares] = await Promise.all([
            apiGet(request, '/api/master/vendor'),
            apiGet(request, '/api/master/spare'),
        ])
        const vendor = getList(vendors)[0]
        const spare = getList(spares)[0]
        if (!vendor || !spare) return test.skip()

        const beforeSpare = await apiGet(request, `/api/master/spare/${spare.id}`)
        const stockBefore = getItem(beforeSpare).currentStock || 0

        const qty = 5
        const res = await apiPost(request, '/api/inventory/purchase', {
            vendorId: vendor.id,
            status: 'RECEIVED',
            notes: `API test received ${uid()}`,
            vatRate: 7,
            items: [
                {
                    spareId: spare.id,
                    quantity: qty,
                    unitPrice: Number(spare.costPrice) || 500,
                },
            ],
        })
        expectSuccess(res, 201)
        expect(getItem(res).status).toBe('RECEIVED')

        const afterSpare = await apiGet(request, `/api/master/spare/${spare.id}`)
        expect(getItem(afterSpare).currentStock).toBe(stockBefore + qty)
    })

    test('POST /api/inventory/purchase — should calculate totals correctly', async ({ request }) => {
        const [vendors, spares] = await Promise.all([
            apiGet(request, '/api/master/vendor'),
            apiGet(request, '/api/master/spare'),
        ])
        const vendor = getList(vendors)[0]
        const spare = getList(spares)[0]
        if (!vendor || !spare) return test.skip()

        const qty = 3
        const price = 100
        const res = await apiPost(request, '/api/inventory/purchase', {
            vendorId: vendor.id,
            status: 'PENDING',
            vatRate: 7,
            items: [{ spareId: spare.id, quantity: qty, unitPrice: price }],
        })
        expectSuccess(res, 201)
        const po = getItem(res)
        expect(po.items.length).toBe(1)
    })
})
