import { test, expect } from './fixtures/shared-page';

test.describe('공유 기능 테스트', () => {
  test('공유 버튼 클릭 시 링크가 복사된다', async ({ sharedPage: page }) => {
    // dialog 이벤트 핸들러 설정
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('링크가 복사되었습니다');
      await dialog.accept();
    });

    // 공유 버튼 클릭
    const shareButton = page.locator('button:has-text("공유")');
    await shareButton.scrollIntoViewIfNeeded();
    await shareButton.click({ force: true });
  });
});
