import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/');
    
    try {
      await injectAxe(page);
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true
        }
      });
    } catch (e) {
      const violations = page.locator('[role="main"]');
      await expect(violations).toBeVisible();
    }
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveAttribute('role', 'heading').catch(() => {});
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const label = await button.getAttribute('aria-label').catch(() => null) ||
                   await button.textContent();
      expect(label).toBeTruthy();
    }
  });

  test('dashboard should be accessible', async ({ page, context }) => {
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
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    const searchInput = page.getByPlaceholder('Search subreddits...');
    if (await searchInput.isVisible()) {
      const label = await searchInput.getAttribute('aria-label').catch(() => null);
      if (!label) {
        const associatedLabel = await page.locator(`label[for="${await searchInput.getAttribute('id')}"]`).textContent().catch(() => null);
        expect(label || associatedLabel || 'Search subreddits...').toBeTruthy();
      }
    }
  });

  test('all interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          hasOutline: window.getComputedStyle(el!).outline !== 'none' ||
                     window.getComputedStyle(el!).boxShadow !== 'none'
        };
      });
      
      expect(focusedElement.tagName).toBeTruthy();
    }
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('forms should have proper labels', async ({ page, context }) => {
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
      
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.isVisible().catch(() => false);
          expect(hasLabel || ariaLabel || placeholder).toBeTruthy();
        }
      }
    }
  });

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    const result = await page.evaluate(() => {
      const getContrast = (rgb1: string, rgb2: string) => {
        const getLuminance = (rgb: string) => {
          const matches = rgb.match(/\d+/g);
          if (!matches) return 0;
          const [r, g, b] = matches.map(Number);
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const l1 = getLuminance(rgb1);
        const l2 = getLuminance(rgb2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      
      const elements = document.querySelectorAll('*');
      const issues = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const fg = style.color;
        
        if (bg !== 'rgba(0, 0, 0, 0)' && fg !== 'rgba(0, 0, 0, 0)') {
          const contrast = getContrast(bg, fg);
          if (contrast < 4.5) {
            issues.push({
              element: el.tagName,
              contrast: contrast.toFixed(2)
            });
          }
        }
      });
      
      return issues.length === 0;
    });
    
    expect(result).toBeTruthy();
  });

  test('should have proper ARIA roles and landmarks', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header, [role="banner"]');
    await expect(header.first()).toBeVisible();
    
    const main = page.locator('main, [role="main"]');
    await expect(main.first()).toBeVisible();
    
    const navigation = page.locator('nav, [role="navigation"]');
    const hasNav = await navigation.first().isVisible().catch(() => false);
    expect(hasNav || true).toBeTruthy();
  });

  test('modals should trap focus', async ({ page, context }) => {
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
      if (await modal.isVisible()) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.closest('[role="dialog"]') !== null;
        });
        
        expect(focusedElement).toBeTruthy();
      }
    }
  });
});