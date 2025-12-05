import { test, expect } from './fixtures/shared-page';

test.describe('UI 상태 테스트', () => {
  test('페이지 로드 시 기본 UI 요소가 표시된다', async ({ sharedPage: page }) => {
    // 헤더 확인
    await expect(page.locator('h1')).toContainText('오늘 뭐 입지?');

    // 날씨 카드 확인
    await expect(page.locator('text=서울').first()).toBeVisible();
    await expect(page.locator('text=체감').first()).toBeVisible();
    await expect(page.locator('text=습도').first()).toBeVisible();
    await expect(page.locator('text=풍속').first()).toBeVisible();

    // 나이대 설정 섹션 확인
    await expect(page.locator('text=나이대 설정')).toBeVisible();

    // 옷차림 가이드 확인
    await expect(page.locator('text=오늘의 옷차림 가이드')).toBeVisible();
  });

  test('새로고침 버튼이 동작한다', async ({ sharedPage: page }) => {
    const refreshButton = page.getByRole('button', { name: '새로고침' });
    
    // 새로고침 버튼 확인
    await expect(refreshButton).toBeVisible();

    // 클릭
    await refreshButton.click();
    
    // 데이터가 다시 로드될 때까지 대기
    await expect(page.locator('text=오늘의 옷차림 가이드')).toBeVisible({ timeout: 15000 });
  });
});
