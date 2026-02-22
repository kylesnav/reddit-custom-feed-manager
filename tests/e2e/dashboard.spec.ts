import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication by setting cookies
    // In a real scenario, you'd use actual auth tokens
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
          scope: 'identity read',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('should display dashboard components', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main sections
    await expect(page.locator('text=Your Subreddits')).toBeVisible();
    await expect(page.locator('text=Custom Feeds')).toBeVisible();
    
    // Check for search functionality
    const searchInput = page.getByPlaceholder('Search subreddits...');
    await expect(searchInput).toBeVisible();
    
    // Check for filter buttons
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'SFW' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'NSFW' })).toBeVisible();
  });

  test('should open create feed modal', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click the create feed button
    const createButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await createButton.click();
    
    // Check if modal is open
    await expect(page.locator('text=Create New Custom Feed')).toBeVisible();
    await expect(page.getByLabel('Feed Name *')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should filter subreddits by search', async ({ page }) => {
    await page.goto('/dashboard');
    
    const searchInput = page.getByPlaceholder('Search subreddits...');
    await searchInput.fill('test');
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('test');
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find theme toggle button (sun/moon icon)
    const themeToggle = page.locator('button').filter({ 
      has: page.locator('svg.h-5.w-5') 
    }).nth(0);
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('class');
    
    // Toggle theme
    await themeToggle.click();
    
    // Check theme changed
    const newTheme = await htmlElement.getAttribute('class');
    expect(newTheme).not.toBe(initialTheme);
  });
});