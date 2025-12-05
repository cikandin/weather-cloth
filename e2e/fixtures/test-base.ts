import { test as base, expect } from '@playwright/test';

/**
 * 공통 테스트 설정
 * - 페이지 로드 후 옷차림 가이드가 표시될 때까지 대기
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // 페이지 로드
    await page.goto('/');
    
    // 옷차림 가이드가 로드될 때까지 대기 (모든 주요 컴포넌트 로딩 완료)
    await expect(page.locator('text=오늘의 옷차림 가이드')).toBeVisible({ timeout: 15000 });
    
    await use(page);
  },
});

export { expect };

/**
 * 공통 헬퍼 함수들
 */
export const helpers = {
  /**
   * 버튼을 안전하게 클릭 (스크롤 + force click)
   */
  async clickButton(page: ReturnType<typeof base.extend>['page'] extends Promise<infer T> ? T : never, selector: string) {
    const button = page.locator(selector);
    await button.scrollIntoViewIfNeeded();
    await button.click({ force: true });
  },
};

