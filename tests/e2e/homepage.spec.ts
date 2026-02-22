import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Reddit Feed Manager');
    
    // Check for login button
    const loginButton = page.getByRole('button', { name: /Login with Reddit/i });
    await expect(loginButton).toBeVisible();
    
    // Check for feature cards - use more specific selectors
    await expect(page.locator('h3:has-text("Bulk Management")')).toBeVisible();
    await expect(page.locator('h3:has-text("Fast & Efficient")')).toBeVisible();
    await expect(page.locator('h3:has-text("Custom Feeds")').first()).toBeVisible();
    await expect(page.locator('h3:has-text("Secure OAuth")')).toBeVisible();
  });

  test('should navigate to login when clicking login button', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.getByRole('button', { name: /Login with Reddit/i });
    await loginButton.click();
    
    // Should redirect to Reddit OAuth - updated to match actual behavior
    await page.waitForURL(/reddit\.com|\/api\/auth\/login/, { timeout: 5000 });
    const url = page.url();
    expect(url.includes('reddit.com') || url.includes('/api/auth/login')).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /Login with Reddit/i })).toBeVisible();
  });
});