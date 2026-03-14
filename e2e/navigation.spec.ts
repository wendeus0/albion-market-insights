import { test, expect } from '@playwright/test';

test.describe('Navegação', () => {
  test('página inicial carrega com título correto', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Albion/i);
  });

  test('CTA "Open Dashboard" navega para /dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /open dashboard/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('link "Price Alerts" no navbar navega para /alerts', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /price alerts/i }).click();
    await expect(page).toHaveURL(/\/alerts/);
  });

  test('link "About" no navbar navega para /about', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });
});
