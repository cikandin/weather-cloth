import { test, expect } from './fixtures/shared-page';

test.describe('나이대 설정 테스트', () => {
  test('아동 선택 시 체감온도가 보정되고 팁이 표시된다', async ({ sharedPage: page }) => {
    // 아동 버튼 찾기 및 클릭
    const childButton = page.locator('button:has-text("아동")').first();
    await childButton.scrollIntoViewIfNeeded();
    await childButton.click({ force: true });
    
    // 상태 변경 대기 - 보정 메시지가 표시될 때까지
    await expect(page.locator('text=아동 기준 보정 적용')).toBeVisible({ timeout: 10000 });

    // 아동 팁이 표시되는지 확인
    await expect(page.locator('text=아동 팁:')).toBeVisible();
    await expect(page.locator('text=활동량이 많아요')).toBeVisible();
  });

  test('시니어 선택 시 체감온도가 보정되고 팁이 표시된다', async ({ sharedPage: page }) => {
    // 시니어 버튼 찾기 및 클릭
    const seniorButton = page.locator('button:has-text("시니어")').first();
    await seniorButton.scrollIntoViewIfNeeded();
    await seniorButton.click({ force: true });
    
    // 상태 변경 대기 - 보정 메시지가 표시될 때까지
    await expect(page.locator('text=시니어 기준 보정 적용')).toBeVisible({ timeout: 10000 });

    // 시니어 팁이 표시되는지 확인
    await expect(page.locator('text=시니어 팁:')).toBeVisible();
    await expect(page.locator('text=체온 유지가 중요해요')).toBeVisible();
  });

  test('성인 선택 시 보정 메시지가 사라진다', async ({ sharedPage: page }) => {
    // 먼저 아동으로 변경
    const childButton = page.locator('button:has-text("아동")').first();
    await childButton.scrollIntoViewIfNeeded();
    await childButton.click({ force: true });
    
    // 아동 보정 메시지가 나타날 때까지 대기
    await expect(page.locator('text=아동 기준 보정 적용')).toBeVisible({ timeout: 10000 });

    // 성인으로 다시 변경
    const adultButton = page.locator('button:has-text("성인")').first();
    await adultButton.click({ force: true });
    
    // 보정 메시지가 사라질 때까지 대기
    await expect(page.locator('text=아동 기준 보정 적용')).not.toBeVisible({ timeout: 5000 });
    
    // 보정 메시지가 표시되지 않는지 확인
    await expect(page.locator('text=기준 보정 적용')).not.toBeVisible();
  });
});
