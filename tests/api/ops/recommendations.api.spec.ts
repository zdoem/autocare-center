import { test, expect } from '@playwright/test'
import { apiGet, expectError } from '../../fixtures/api-helpers'

test.describe('API: Ops - Recommendations', () => {
    test('GET /api/ops/recommendations?carId= — should return recommendations array', async ({ request }) => {
        // Get a car first
        const cars = await apiGet(request, '/api/master/car')
        const car = cars.body.data[0]
        if (!car) return test.skip()

        const res = await apiGet(request, '/api/ops/recommendations', {
            carId: car.id,
            mileage: '50000',
        })
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test('GET /api/ops/recommendations — should reject missing carId', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/recommendations')
        expectError(res, 400)
    })

    test('GET /api/ops/recommendations?carId=invalid — should return 404 for invalid car', async ({ request }) => {
        const res = await apiGet(request, '/api/ops/recommendations', {
            carId: 'nonexistent-car-id',
            mileage: '10000',
        })
        expectError(res, 404)
    })
})
