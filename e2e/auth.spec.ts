import { test, expect } from '@playwright/test';

test.describe('Autenticacao', () => {
  test('visitante em /profile eh redirecionado para /login', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
  });

  test('visitante ve banner de autenticacao em /alerts', async ({ page }) => {
    await page.goto('/alerts');

    await expect(page.getByRole('heading', { name: /price alerts/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /faça login/i })).toBeVisible();
  });
});
