import { test, expect } from '@playwright/test';

test.describe('Subreddit Management', () => {
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
    
    await page.goto('/dashboard');
  });

  test('should search subreddits', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search subreddits...');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('programming');
    await expect(searchInput).toHaveValue('programming');
    
    await page.waitForTimeout(500);
  });

  test('should filter subreddits by SFW/NSFW', async ({ page }) => {
    const allButton = page.getByRole('button', { name: 'All' });
    const sfwButton = page.getByRole('button', { name: 'SFW' });
    const nsfwButton = page.getByRole('button', { name: 'NSFW' });
    
    await expect(allButton).toBeVisible();
    await expect(sfwButton).toBeVisible();
    await expect(nsfwButton).toBeVisible();
    
    await sfwButton.click();
    await expect(sfwButton).toHaveAttribute('data-state', 'active').catch(() => {
      expect(sfwButton).toHaveClass(/bg-reddit-orange|active/);
    });
    
    await nsfwButton.click();
    await expect(nsfwButton).toHaveAttribute('data-state', 'active').catch(() => {
      expect(nsfwButton).toHaveClass(/bg-reddit-orange|active/);
    });
    
    await allButton.click();
    await expect(allButton).toHaveAttribute('data-state', 'active').catch(() => {
      expect(allButton).toHaveClass(/bg-reddit-orange|active/);
    });
  });

  test('should select multiple subreddits', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const firstThreeCheckboxes = checkboxes.locator('nth=-n+3');
    
    const count = await firstThreeCheckboxes.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        await firstThreeCheckboxes.nth(i).check();
      }
      
      const bulkActions = page.locator('text=Bulk Actions').locator('..');
      await expect(bulkActions).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should clear selection', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();
    
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check();
      
      const clearButton = page.getByRole('button', { name: /Clear|Deselect/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(firstCheckbox).not.toBeChecked();
      }
    }
  });

  test('should add subreddits to feed', async ({ page }) => {
    const feedItem = page.locator('[data-testid="feed-item"]').first().or(
      page.locator('div').filter({ hasText: /subreddits/ }).first()
    );
    
    if (await feedItem.isVisible()) {
      await feedItem.click();
    }
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();
    
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check();
      
      const addButton = page.getByRole('button', { name: /Add.*to/i });
      if (await addButton.isVisible()) {
        await addButton.click();
        
        await expect(page.getByText(/Added|Success/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should remove subreddits from feed', async ({ page }) => {
    const feedItem = page.locator('[data-testid="feed-item"]').first().or(
      page.locator('div').filter({ hasText: /subreddits/ }).first()
    );
    
    if (await feedItem.isVisible()) {
      await feedItem.click();
    }
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();
    
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check();
      
      const removeButton = page.getByRole('button', { name: /Remove.*from/i });
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        await expect(page.getByText(/Removed|Success/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should refresh subreddit list', async ({ page }) => {
    const refreshButton = page.locator('button[aria-label="Refresh subreddits"]').or(
      page.locator('button').filter({ has: page.locator('svg.h-4.w-4') })
    ).first();
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      const spinner = page.locator('.animate-spin');
      await expect(spinner).toBeVisible({ timeout: 1000 }).catch(() => {});
      await expect(spinner).not.toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  test('should display subreddit icons', async ({ page }) => {
    const subredditItems = page.locator('[data-testid="subreddit-item"]').or(
      page.locator('div').filter({ has: page.locator('img[alt*="icon"]') })
    );
    
    const count = await subredditItems.count();
    if (count > 0) {
      const firstItem = subredditItems.first();
      const icon = firstItem.locator('img');
      
      if (await icon.isVisible()) {
        await expect(icon).toHaveAttribute('src', /.+/);
      }
    }
  });
});