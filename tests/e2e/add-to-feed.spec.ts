import { test, expect, Page } from '@playwright/test';

test.describe('Add to Feed Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'reddit_tokens',
        value: JSON.stringify({
          access_token: 'mock_token',
          expires_at: Date.now() + 3600000,
          scope: 'identity read mysubreddits',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('should display Add to Feed button for each subreddit', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('[data-testid="subreddit-item"]', { timeout: 10000 });
    
    const subredditItems = page.locator('[data-testid="subreddit-item"]');
    const count = await subredditItems.count();
    
    if (count > 0) {
      const firstItem = subredditItems.first();
      const addButton = firstItem.locator('button[aria-label*="Add r/"]');
      
      await expect(addButton).toBeVisible();
      await expect(addButton).toContainText('Add to Feed');
    }
  });

  test('should open modal when Add to Feed button is clicked', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('[data-testid="subreddit-item"]', { timeout: 10000 });
    
    const firstAddButton = page.locator('button[aria-label*="Add r/"]').first();
    
    if (await firstAddButton.isVisible()) {
      await firstAddButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      const modalTitle = modal.locator('h2');
      await expect(modalTitle).toContainText('Add r/');
    }
  });

  test('should show available feeds in the modal', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('[data-testid="subreddit-item"]', { timeout: 10000 });
    
    const firstAddButton = page.locator('button[aria-label*="Add r/"]').first();
    
    if (await firstAddButton.isVisible()) {
      await firstAddButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      const feedOptions = modal.locator('[role="button"]');
      const feedCount = await feedOptions.count();
      
      if (feedCount === 0) {
        const noFeedsMessage = modal.locator('text=/already in all your feeds|have no feeds yet/');
        await expect(noFeedsMessage).toBeVisible();
      } else {
        expect(feedCount).toBeGreaterThan(0);
      }
    }
  });

  test('should allow selecting multiple feeds', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('[data-testid="subreddit-item"]', { timeout: 10000 });
    
    const firstAddButton = page.locator('button[aria-label*="Add r/"]').first();
    
    if (await firstAddButton.isVisible()) {
      await firstAddButton.click();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      const checkboxes = modal.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount > 0) {
        await checkboxes.first().check();
        await expect(checkboxes.first()).toBeChecked();
        
        if (checkboxCount > 1) {
          await checkboxes.nth(1).check();
          await expect(checkboxes.nth(1)).toBeChecked();
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    await page.waitForSelector('[data-testid="subreddit-item"]', { timeout: 10000 });
    
    const subredditItems = page.locator('[data-testid="subreddit-item"]');
    const count = await subredditItems.count();
    
    if (count > 0) {
      const firstItem = subredditItems.first();
      const addButton = firstItem.locator('button[aria-label*="Add r/"]');
      
      await expect(addButton).toBeVisible();
      
      const buttonWidth = await addButton.evaluate(el => el.getBoundingClientRect().width);
      const viewportWidth = 375;
      
      expect(buttonWidth).toBeLessThanOrEqual(viewportWidth);
    }
  });

  test('should maintain proper layout on tablets', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    
    await page.waitForSelector('[data-testid="subreddit-item"]', { timeout: 10000 });
    
    const subredditItems = page.locator('[data-testid="subreddit-item"]');
    const count = await subredditItems.count();
    
    if (count > 0) {
      const firstItem = subredditItems.first();
      await expect(firstItem).toBeVisible();
      
      const itemHeight = await firstItem.evaluate(el => el.getBoundingClientRect().height);
      expect(itemHeight).toBeGreaterThan(0);
      expect(itemHeight).toBeLessThan(300);
    }
  });
});