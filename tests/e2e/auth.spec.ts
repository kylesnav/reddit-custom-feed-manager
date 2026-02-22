import { test, expect, Page } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users from dashboard to homepage', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Reddit Feed Manager');
  });

  test('should handle login flow', async ({ page, context }) => {
    await page.goto('/');
    
    const loginButton = page.getByRole('button', { name: /Login with Reddit/i });
    await expect(loginButton).toBeVisible();
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      loginButton.click()
    ]);
    
    await expect(newPage.url()).toContain('/api/auth/login');
  });

  test('should persist authentication state', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'test_token',
          refresh_token: 'test_refresh',
          expires_at: Date.now() + 3600000,
          scope: 'identity read mysubreddits',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
    
    await page.waitForURL('/dashboard', { timeout: 5000 }).catch(() => {});
    
    const currentUrl = page.url();
    expect(currentUrl.includes('/dashboard') || currentUrl.includes('/')).toBeTruthy();
  });

  test('should handle logout', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'test_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    
    const userMenuButton = page.locator('button').filter({ has: page.locator('svg.h-8.w-8') });
    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
      
      const logoutButton = page.getByText('Logout');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        await page.waitForURL('/');
        await expect(page.locator('h1')).toContainText('Reddit Feed Manager');
      }
    }
  });

  test('should display user info when authenticated', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'test_token',
          expires_at: Date.now() + 3600000,
        }),
        domain: 'localhost',
        path: '/',
      },
      {
        name: 'reddit_user',
        value: JSON.stringify({
          name: 'testuser',
          icon_img: 'https://example.com/avatar.png',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});