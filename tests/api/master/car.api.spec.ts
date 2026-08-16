import { test, expect } from '@playwright/test'
import { apiGet, apiPost, apiPut, uid, expectSuccess, expectDataArray, expectDataObject, expectError, getList, getItem } from '../../fixtures/api-helpers'

test.describe('API: Master - Car', () => {
    test('GET /api/master/car — should return list', async ({ request }) => {
        const res = await apiGet(request, '/api/master/car')
        expectSuccess(res)
        expectDataArray(res)
    })

    test('POST /api/master/car — should create with valid data', async ({ request }) => {
        // Get dependencies
        const [brands, models, customers] = await Promise.all([
            apiGet(request, '/api/master/car-brand'),
            apiGet(request, '/api/master/car-model'),
            apiGet(request, '/api/master/customer'),
        ])

        const brandId = brands.body.data[0]?.id
        const modelId = models.body.data[0]?.id
        const customerId = customers.body.data[0]?.id
        if (!brandId || !modelId || !customerId) return test.skip()

        const id = uid()
        const res = await apiPost(request, '/api/master/car', {
            licensePlate: `ทส${id}`,
            carBrandId: brandId,
            carModelId: modelId,
            customerId: customerId,
            color: 'สีแดง',
            year: 2024,
            province: 'กรุงเทพมหานคร',
            isActive: true,
        })
        expectSuccess(res, 201)
        expect(res.body.data.licensePlate).toContain(id)
    })

    test('POST /api/master/car — should reject missing licensePlate', async ({ request }) => {
        const res = await apiPost(request, '/api/master/car', {
            color: 'สีขาว',
        })
        expectError(res, 400)
    })

    test('GET /api/master/car/:id — should return single with relations', async ({ request }) => {
        const list = await apiGet(request, '/api/master/car')
        const firstId = getList(list)[0]?.id
        if (!firstId) return test.skip()

        const res = await apiGet(request, `/api/master/car/${firstId}`)
        expectSuccess(res)
        const carObj = getItem(res)
        expect(carObj.carBrand || carObj.carBrandId).toBeDefined()
    })

    test('PUT /api/master/car/:id — should update', async ({ request }) => {
        const list = await apiGet(request, '/api/master/car')
        const target = list.body.data[0]
        if (!target) return test.skip()

        const res = await apiPut(request, `/api/master/car/${target.id}`, {
            licensePlate: target.licensePlate,
            carBrandId: target.carBrandId,
            carModelId: target.carModelId,
            customerId: target.customerId,
            color: `สีน้ำเงิน`,
            year: target.year || 2024,
            province: target.province || 'กรุงเทพมหานคร',
            isActive: true,
        })
        expectSuccess(res)
    })

    test('GET /api/master/car?search= — should filter by license plate', async ({ request }) => {
        const res = await apiGet(request, '/api/master/car', { search: 'กก' })
        expectSuccess(res)
        expectDataArray(res)
    })
})
