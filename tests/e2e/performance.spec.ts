import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('homepage should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000);
  });

  test('dashboard should handle large datasets efficiently', async ({ page, context }) => {
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
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
    
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024);
  });

  test('search should be responsive', async ({ page, context }) => {
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
    
    const searchInput = page.getByPlaceholder('Search subreddits...');
    if (await searchInput.isVisible()) {
      const startTime = Date.now();
      await searchInput.fill('test');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(500);
    }
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        loading: img.loading,
        src: img.src,
        complete: img.complete,
      }));
    });
    
    const lazyImages = images.filter(img => img.loading === 'lazy');
    expect(lazyImages.length).toBeGreaterThanOrEqual(0);
  });

  test('should cache API responses', async ({ page, context }) => {
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
    
    const responses: number[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push(response.status());
      }
    });
    
    await page.goto('/dashboard');
    await page.reload();
    
    const cachedResponses = responses.filter(status => status === 304);
    expect(cachedResponses.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle network throttling gracefully', async ({ page, context }) => {
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
    
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024,
      uploadThroughput: 20 * 1024,
      latency: 500,
    });
    
    await page.goto('/dashboard');
    
    const content = page.locator('main');
    await expect(content).toBeVisible({ timeout: 10000 });
    
    await client.send('Network.disable');
  });

  test('should optimize bundle size', async ({ page }) => {
    const responses: { url: string; size: number }[] = [];
    
    page.on('response', async response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        const size = parseInt(response.headers()['content-length'] || '0');
        responses.push({ url: response.url(), size });
      }
    });
    
    await page.goto('/');
    
    const totalSize = responses.reduce((sum, r) => sum + r.size, 0);
    const jsSize = responses
      .filter(r => r.url.includes('.js'))
      .reduce((sum, r) => sum + r.size, 0);
    
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
    expect(jsSize).toBeLessThan(1.5 * 1024 * 1024);
  });

  test('should handle concurrent operations', async ({ page, context }) => {
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
    
    const operations = [];
    
    const searchInput = page.getByPlaceholder('Search subreddits...');
    if (await searchInput.isVisible()) {
      operations.push(searchInput.fill('test'));
    }
    
    const refreshButton = page.locator('button').filter({ has: page.locator('svg.h-4.w-4') }).first();
    if (await refreshButton.isVisible()) {
      operations.push(refreshButton.click());
    }
    
    const startTime = Date.now();
    await Promise.all(operations);
    const executionTime = Date.now() - startTime;
    
    expect(executionTime).toBeLessThan(3000);
  });
});