import { test, expect } from './fixtures/shared-page';

test.describe('옷차림 모드 테스트', () => {
  test('실내 생활 모드 선택 시 옷 추천이 변경된다', async ({ sharedPage: page }) => {
    // 실내 생활 버튼 찾기
    const indoorButton = page.locator('button:has-text("실내 생활")');
    await indoorButton.scrollIntoViewIfNeeded();
    await indoorButton.click({ force: true });

    // 실내 안내 메시지가 표시되는지 확인
    await expect(page.locator('text=냉난방이 있는 실내 기준이에요')).toBeVisible({ timeout: 5000 });

    // 하의 섹션이 숨겨졌는지 확인 (실내 모드에서는 하의 추천 없음)
    await expect(page.locator('text=👖 하의')).not.toBeVisible();
  });

  test('외출할 때 모드 선택 시 전체 옷 추천이 표시된다', async ({ sharedPage: page }) => {
    // 먼저 실내 모드로 변경
    const indoorButton = page.locator('button:has-text("실내 생활")');
    await indoorButton.scrollIntoViewIfNeeded();
    await indoorButton.click({ force: true });
    
    // 실내 메시지 확인
    await expect(page.locator('text=냉난방이 있는 실내 기준이에요')).toBeVisible({ timeout: 5000 });
    
    // 다시 외출 모드로 변경
    const outdoorButton = page.locator('button:has-text("외출할 때")');
    await outdoorButton.click({ force: true });

    // 하의 섹션이 표시되는지 확인
    await expect(page.locator('text=👖 하의')).toBeVisible({ timeout: 5000 });

    // 실내 안내 메시지가 숨겨졌는지 확인
    await expect(page.locator('text=냉난방이 있는 실내 기준이에요')).not.toBeVisible();
  });
});
