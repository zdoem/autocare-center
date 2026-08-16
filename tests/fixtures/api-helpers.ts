/**
 * tests/fixtures/api-helpers.ts
 * Shared utility functions for Direct API & Integration Tests
 * Uses Playwright's APIRequestContext for headless HTTP calls
 */

import { APIRequestContext, expect } from '@playwright/test'

const BASE_URL = 'http://127.0.0.1:3000'

/** Generate a unique suffix based on timestamp */
export const uid = () => Date.now().toString().slice(-5)

/** GET with optional query params, returns parsed JSON */
export async function apiGet(
    request: APIRequestContext,
    path: string,
    params?: Record<string, string>
) {
    const url = new URL(path, BASE_URL)
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const res = await request.get(url.toString())
    let body: any = {}
    try {
        const text = await res.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        body = {}
    }
    return { status: res.status(), body }
}

/** POST with JSON body, returns parsed JSON */
export async function apiPost(
    request: APIRequestContext,
    path: string,
    data: Record<string, unknown>
) {
    const res = await request.post(`${BASE_URL}${path}`, { data })
    let body: any = {}
    try {
        const text = await res.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        body = {}
    }
    return { status: res.status(), body }
}

/** PUT with JSON body, returns parsed JSON */
export async function apiPut(
    request: APIRequestContext,
    path: string,
    data: Record<string, unknown>
) {
    const res = await request.put(`${BASE_URL}${path}`, { data })
    let body: any = {}
    try {
        const text = await res.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        body = {}
    }
    return { status: res.status(), body }
}

/** DELETE, returns parsed JSON */
export async function apiDelete(
    request: APIRequestContext,
    path: string
) {
    const res = await request.delete(`${BASE_URL}${path}`)
    if (res.status() === 204) {
        return { status: 204, body: {} }
    }
    let body: any = {}
    try {
        const text = await res.text()
        body = text ? JSON.parse(text) : {}
    } catch {
        body = {}
    }
    return { status: res.status(), body }
}

/** Assert response status is expected and body is not an error */
export function expectSuccess(result: { status: number; body: any }, expectedStatus = 200) {
    if (expectedStatus === 201) {
        expect([200, 201]).toContain(result.status)
    } else {
        expect(result.status).toBe(expectedStatus)
    }
    if (result.body.success !== undefined) {
        expect(result.body.success).toBe(true)
    } else {
        expect(result.body.error).toBeUndefined()
    }
}

/** Assert response is an error with expected status code */
export function expectError(result: { status: number; body: any }, expectedStatus: number) {
    expect(result.status).toBe(expectedStatus)
}

/** Assert body.data (or body itself) is an array */
export function expectDataArray(result: { body: any }) {
    const list = getList(result)
    expect(Array.isArray(list)).toBe(true)
}

/** Assert body.data is an object with an id field */
export function expectDataObject(result: { body: any }) {
    const obj = getItem(result)
    expect(obj).toBeDefined()
    expect(obj.id).toBeDefined()
}

/** Extract list array from response regardless of envelope format */
export function getList(res: { body: any }): any[] {
    if (Array.isArray(res.body)) return res.body
    if (Array.isArray(res.body?.data)) return res.body.data
    return []
}

/** Extract item object from response regardless of envelope format */
export function getItem(res: { body: any }): any {
    if (res.body?.data !== undefined) return res.body.data
    return res.body
}
