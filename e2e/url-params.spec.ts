import { test, expect } from './fixtures/shared-page';

test.describe('URL 파라미터 테스트', () => {
  test('age=child 파라미터로 접속 시 아동이 선택된다', async ({ sharedPage: page }) => {
    // URL 파라미터로 다시 접속
    await page.goto('/?age=child');
    
    // 옷차림 가이드 로딩 대기
    await expect(page.locator('text=오늘의 옷차림 가이드')).toBeVisible({ timeout: 15000 });

    // 아동 보정 메시지 확인
    await expect(page.locator('text=아동 기준 보정 적용')).toBeVisible({ timeout: 5000 });
  });

  test('age=senior 파라미터로 접속 시 시니어가 선택된다', async ({ sharedPage: page }) => {
    // URL 파라미터로 다시 접속
    await page.goto('/?age=senior');
    
    // 옷차림 가이드 로딩 대기
    await expect(page.locator('text=오늘의 옷차림 가이드')).toBeVisible({ timeout: 15000 });

    // 시니어 보정 메시지 확인
    await expect(page.locator('text=시니어 기준 보정 적용')).toBeVisible({ timeout: 5000 });
  });
});
