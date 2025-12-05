import { test as base, expect, Page } from '@playwright/test';

/**
 * Worker 스코프 sharedPage fixture
 * 
 * - workers=N (병렬): 각 worker마다 별도 페이지 → 독립 테스트
 * - workers=1 (순차): 모든 테스트가 같은 페이지 공유 → 사이드이펙트 테스트
 * 
 * 사용법:
 *   pnpm test                    # 병렬 (독립)
 *   pnpm test --workers=1        # 순차 (페이지 공유)
 */
export const test = base.extend<{}, { sharedPage: Page }>({
  sharedPage: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 초기 페이지 로드
    await page.goto('/');
    await expect(page.locator('text=오늘의 옷차림 가이드')).toBeVisible({ timeout: 15000 });
    
    await use(page);
    
    await page.close();
    await context.close();
  }, { scope: 'worker' }],
});

export { expect };
