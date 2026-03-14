import { test, expect } from '@playwright/test';

test.describe('Alertas de Preço', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts');
  });

  test('página carrega com header "Price Alerts"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /price alerts/i })).toBeVisible();
  });

  test('clicar em "Create Alert" abre o dialog', async ({ page }) => {
    await page.getByRole('button', { name: /create alert/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create Price Alert')).toBeVisible();
  });

  test('dialog fecha ao clicar em Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /create alert/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('submeter sem preencher exibe mensagem de validação', async ({ page }) => {
    await page.getByRole('button', { name: /create alert/i }).first().click();
    const submitButton = page.getByRole('button', { name: /create alert/i }).last();
    await submitButton.click();
    await expect(page.getByText('Selecione um item')).toBeVisible();
  });

  test('exibe estado vazio quando não há alertas', async ({ page }) => {
    test.setTimeout(120000);
    // Limpa alertas do localStorage
    await page.evaluate(() => localStorage.removeItem('albion_alerts'));
    await page.reload();
    await expect(page.getByText('No alerts yet')).toBeVisible({ timeout: 10000 });
  });
});
