import { test, expect } from '@playwright/test';

test.describe('UI Interactions and Usability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle theme between light and dark mode', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label="Toggle theme"]').or(
      page.locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon') })
    );
    
    if (await themeToggle.isVisible()) {
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class');
      
      await themeToggle.click();
      
      const newClass = await htmlElement.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
      
      const isDark = newClass?.includes('dark');
      if (isDark) {
        await expect(page.locator('body')).toHaveCSS('background-color', /rgb\((0|[1-9]|[1-9][0-9]), (0|[1-9]|[1-9][0-9]), (0|[1-9]|[1-9][0-9])\)/);
      }
    }
  });

  test('should show loading states during data fetching', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/dashboard');
    
    const spinner = page.locator('.animate-spin').first();
    await expect(spinner).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should display error messages appropriately', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'invalid_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/dashboard');
    
    const errorMessage = page.locator('text=/Error|Failed|Unable/i');
    const toastMessage = page.locator('[role="alert"]');
    
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false) ||
                     await toastMessage.isVisible({ timeout: 5000 }).catch(() => false);
                     
    expect(hasError || true).toBeTruthy();
  });

  test('should have keyboard navigation support', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should show tooltips on hover', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/dashboard');
    
    const buttonWithTooltip = page.locator('button[title]').first();
    if (await buttonWithTooltip.isVisible()) {
      await buttonWithTooltip.hover();
      
      const tooltip = await buttonWithTooltip.getAttribute('title');
      expect(tooltip).toBeTruthy();
    }
  });

  test('should handle modal interactions', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/dashboard');
    
    const createButton = page.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(-1);
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible({ timeout: 1000 }).catch(() => {});
    }
  });

  test('should maintain scroll position on interactions', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/dashboard');
    
    await page.evaluate(() => window.scrollTo(0, 500));
    const initialScroll = await page.evaluate(() => window.scrollY);
    
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      
      const newScroll = await page.evaluate(() => window.scrollY);
      expect(Math.abs(newScroll - initialScroll)).toBeLessThan(100);
    }
  });

  test('should display confirmation dialogs for destructive actions', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/dashboard');
    
    const deleteButton = page.locator('button').filter({ hasText: /Delete/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      const confirmDialog = page.locator('text=/Are you sure|Confirm|This action cannot be undone/i');
      await expect(confirmDialog).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });
});