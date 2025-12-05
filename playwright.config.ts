import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  projects: [
    // 기본: 병렬 실행 (독립 테스트)
    {
      name: 'parallel',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/fixtures/**',
    },

    // 순차 실행 (사이드이펙트 테스트)
    {
      name: 'sequential',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/fixtures/**',
      fullyParallel: false,
      workers: 1,
    },

    // Smoke 테스트
    {
      name: 'smoke',
      testMatch: ['ui-state.spec.ts', 'age-group.spec.ts'],
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

