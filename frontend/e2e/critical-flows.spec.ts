import { test, expect } from '@playwright/test';
import { e2e } from './e2e-selectors';

test.describe('Critical navigation (default locale, no /vi prefix)', () => {
  test('home loads: main region is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId(e2e.appMain)).toBeVisible();
  });

  test('header: navigate Home → Projects', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(e2e.nav('projects')).click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByTestId(e2e.page.projects)).toBeVisible();
  });

  test('header: open Insights', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId(e2e.nav('insights')).click();
    await expect(page).toHaveURL(/\/insights/);
    await expect(page.getByTestId(e2e.page.insights)).toBeVisible();
  });

  test('EN prefix: /en/insights shows insights shell', async ({ page }) => {
    await page.goto('/en/insights');
    await expect(page.getByTestId(e2e.page.insights)).toBeVisible();
  });
});

test.describe('Contact form (network mocked)', () => {
  test('success: API 200 → success panel', async ({ page }) => {
    await page.route('**/*contact-requests*', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/contact');
    await expect(page.getByTestId(e2e.contact.form)).toBeVisible();
    await page.getByTestId(e2e.contact.name).fill('E2E User');
    await page.getByTestId(e2e.contact.phone).fill('0123456789');
    await page.getByTestId(e2e.contact.submit).click();
    await expect(page.getByTestId(e2e.contact.success)).toBeVisible();
  });

  test('failure: API 500 → error message visible', async ({ page }) => {
    await page.route('**/*contact-requests*', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/contact');
    await page.getByTestId(e2e.contact.name).fill('E2E');
    await page.getByTestId(e2e.contact.phone).fill('0999999999');
    await page.getByTestId(e2e.contact.submit).click();
    await expect(page.getByTestId(e2e.contact.error)).toBeVisible();
  });
});

test.describe('Failure routing', () => {
  test('non-existent project slug → not found UI', async ({ page }) => {
    await page.goto('/projects/e2e-missing-slug-404-xxxxx');
    await expect(page.getByTestId(e2e.notFound)).toBeVisible();
  });
});
