import { test, expect } from '@playwright/test'
import { apiGet } from '../../fixtures/api-helpers'

test.describe('API: Reports', () => {
    // --- Daily Report ---
    test('GET /api/reports/daily — should return daily summary', async ({ request }) => {
        const today = new Date().toISOString().slice(0, 10)
        const res = await apiGet(request, '/api/reports/daily', { date: today })
        expect(res.status).toBe(200)
        // Should contain revenue/expense fields
        expect(res.body).toBeDefined()
    })

    test('GET /api/reports/daily — should accept custom date', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/daily', { date: '2024-01-15' })
        expect(res.status).toBe(200)
    })

    // --- Monthly Report ---
    test('GET /api/reports/monthly — should return monthly summary', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/monthly')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })

    // --- Jobs Today ---
    test('GET /api/reports/jobs-today — should return today jobs', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/jobs-today')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })

    // --- Service Report ---
    test('GET /api/reports/service — should return service statistics', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/service')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })

    // --- Customer Report ---
    test('GET /api/reports/customer — should return customer report', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/customer')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })

    // --- Top Customer ---
    test('GET /api/reports/top-customer — should return top customers', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/top-customer')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })

    // --- Technician Report ---
    test('GET /api/reports/technician — should return technician stats', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/technician')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })

    // --- Payment Report ---
    test('GET /api/reports/payment — should return payment report', async ({ request }) => {
        const res = await apiGet(request, '/api/reports/payment')
        expect(res.status).toBe(200)
        expect(res.body).toBeDefined()
    })
})
