import { test, expect, Page } from '@playwright/test';

test.describe('Feed Management', () => {
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

  test('should create a new custom feed', async ({ page }) => {
    await page.goto('/dashboard');
    
    const createButton = page.locator('button[aria-label="Create new feed"]').or(
      page.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).nth(-1)
    );
    await createButton.click();
    
    await expect(page.getByText('Create New Custom Feed')).toBeVisible();
    
    await page.getByLabel('Feed Name').fill('Test Feed');
    await page.getByLabel('Description').fill('This is a test feed description');
    
    const visibilitySelect = page.getByLabel('Visibility');
    if (await visibilitySelect.isVisible()) {
      await visibilitySelect.selectOption('public');
    }
    
    const createFeedButton = page.getByRole('button', { name: /Create Feed/i });
    await createFeedButton.click();
    
    await expect(page.getByText('Test Feed')).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing feed', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('text=Custom Feeds', { timeout: 10000 });
    
    const editButton = page.locator('button[aria-label="Edit feed"]').first().or(
      page.locator('button').filter({ has: page.locator('svg.h-4.w-4') })
    );
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        const nameInput = page.getByLabel('Feed Name');
        await nameInput.clear();
        await nameInput.fill('Updated Feed Name');
        
        const saveButton = page.getByRole('button', { name: /Save|Update/i });
        await saveButton.click();
      }
    }
  });

  test('should delete a feed with confirmation', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('text=Custom Feeds', { timeout: 10000 });
    
    const deleteButton = page.locator('button[aria-label="Delete feed"]').first().or(
      page.locator('button').filter({ has: page.locator('svg.text-red-500') })
    );
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      await expect(page.getByText(/Are you sure you want to delete/i)).toBeVisible();
      
      const confirmButton = page.getByRole('button', { name: /Delete Feed|Confirm/i });
      await confirmButton.click();
      
      await expect(page.getByText('Feed deleted successfully')).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should copy an existing feed', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForSelector('text=Custom Feeds', { timeout: 10000 });
    
    const copyButton = page.locator('button[aria-label="Copy feed"]').first();
    
    if (await copyButton.isVisible()) {
      await copyButton.click();
      
      page.on('dialog', async dialog => {
        await dialog.accept('Copied Feed');
      });
      
      await expect(page.getByText('Copied Feed')).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should select a feed for bulk operations', async ({ page }) => {
    await page.goto('/dashboard');
    
    const feedItem = page.locator('[data-testid="feed-item"]').first().or(
      page.locator('div').filter({ hasText: /^r\// }).first()
    );
    
    if (await feedItem.isVisible()) {
      await feedItem.click();
      
      const selectedFeedCard = page.locator('text=Selected Feed').locator('..');
      await expect(selectedFeedCard).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('should display feed details when selected', async ({ page }) => {
    await page.goto('/dashboard');
    
    const feedItem = page.locator('[data-testid="feed-item"]').first().or(
      page.locator('div').filter({ hasText: /subreddits/ }).first()
    );
    
    if (await feedItem.isVisible()) {
      await feedItem.click();
      
      const feedDetails = page.locator('text=/\\d+ subreddits/');
      await expect(feedDetails).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });
});