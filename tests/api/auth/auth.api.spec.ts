import { test, expect } from '@playwright/test'
import { apiPost, expectError } from '../../fixtures/api-helpers'

test.describe('API: Auth — Forgot & Reset Password', () => {
    test('POST /api/auth/forgot-password — should handle email request', async ({ request }) => {
        const res = await apiPost(request, '/api/auth/forgot-password', {
            email: 'admin@example.com',
        })
        expect(res.status).toBe(200)
        expect(res.body.message).toBeDefined()
    })

    test('POST /api/auth/forgot-password — should return 400 when email is missing', async ({ request }) => {
        const res = await apiPost(request, '/api/auth/forgot-password', {})
        expectError(res, 400)
    })

    test('POST /api/auth/reset-password — should validate required inputs', async ({ request }) => {
        const res = await apiPost(request, '/api/auth/reset-password', {
            token: 'sample-token',
        })
        expectError(res, 400)
    })

    test('POST /api/auth/reset-password — should validate password length', async ({ request }) => {
        const res = await apiPost(request, '/api/auth/reset-password', {
            token: 'sample-token',
            password: 'short',
        })
        expectError(res, 400)
    })
})
