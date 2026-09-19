import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: false,
    workers: 1,
    reporter: [['html', { open: 'never' }], ['list']],
    globalSetup: './e2e/global-setup.js',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        storageState: './e2e/.auth/admin.json',
    },
    projects: [
        {
            name: 'desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'mobile',
            use: {
                ...devices['Pixel 5'],
                viewport: { width: 390, height: 844 },
            },
        },
    ],
});
