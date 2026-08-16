import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: 1,
    reporter: [['html', { open: 'never' }], ['list']],
    timeout: 30000,

    use: {
        baseURL: 'http://127.0.0.1:3000',
        viewport: { width: 1280, height: 720 },
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'off',
        actionTimeout: 10000,
        navigationTimeout: 15000,
    },

    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },
        {
            name: 'auth-tests',
            testMatch: /tests\/e2e\/auth\/.*\.spec\.ts/,
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'chromium',
            testIgnore: [/tests\/e2e\/auth\/.*\.spec\.ts/, /tests\/api\/.*/],
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'tests/.auth/admin.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'api-tests',
            testMatch: /tests\/api\/.*\.api\.spec\.ts/,
            use: {
                storageState: 'tests/.auth/admin.json',
            },
            dependencies: ['setup'],
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: true,
        timeout: 60000,
    },
})
