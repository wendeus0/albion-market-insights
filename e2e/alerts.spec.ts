import { test, expect } from '@playwright/test';

const seededAlert = {
  id: 'test-alert',
  itemId: 'T4_BAG',
  itemName: 'Bag',
  city: 'Caerleon',
  condition: 'below',
  threshold: 4500,
  isActive: true,
  createdAt: '2026-03-18T00:00:00.000Z',
  notifications: { inApp: true, email: false },
};

test.describe('Alertas de Preço', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts');
    await page.evaluate(() => {
      localStorage.removeItem('albion_alerts');
    });
    await page.reload();
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

  test('cria um alerta válido e exibe feedback visual', async ({ page }) => {
    await page.getByRole('button', { name: /create alert/i }).first().click();

    await page.getByRole('combobox').nth(0).click();
    const firstItemOption = page.getByRole('option').first();
    await expect(firstItemOption).toBeVisible();
    const firstItemText = (await firstItemOption.textContent()) || '';
    const itemName = firstItemText.replace(/^T\d+\s*/, '').trim();
    await firstItemOption.click();

    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /caerleon/i }).click();

    await page.getByRole('button', { name: /below/i }).click();
    await page.getByPlaceholder('e.g., 50000').fill('4500');

    await page.getByRole('button', { name: /create alert/i }).last().click();

    await expect(page.getByText('Alert created!', { exact: true })).toBeVisible();
    await expect(page.locator('p.font-medium', { hasText: itemName })).toBeVisible();
    await expect(page.getByText(/price below 4,500/i)).toBeVisible();
  });

  test('mantém alerta criado após reload', async ({ page }) => {
    await page.getByRole('button', { name: /create alert/i }).first().click();
    await page.getByRole('combobox').nth(0).click();
    const firstItemOption = page.getByRole('option').first();
    await expect(firstItemOption).toBeVisible();
    const firstItemText = (await firstItemOption.textContent()) || '';
    const itemName = firstItemText.replace(/^T\d+\s*/, '').trim();
    await firstItemOption.click();
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: /caerleon/i }).click();
    await page.getByPlaceholder('e.g., 50000').fill('4500');
    await page.getByRole('button', { name: /create alert/i }).last().click();

    await expect(page.locator('p.font-medium', { hasText: itemName })).toBeVisible();
    await page.reload();
    await expect(page.locator('p.font-medium', { hasText: itemName })).toBeVisible();
    await expect(page.getByText(/price below 4,500/i)).toBeVisible();
  });

  test('permite alternar status do alerta existente', async ({ page }) => {
    await page.addInitScript((alert) => {
      localStorage.setItem('albion_alerts', JSON.stringify([alert]));
    }, seededAlert);
    await page.reload();

    await expect(page.getByText('Bag')).toBeVisible();
    const toggleButton = page.locator('button.h-8.w-8').first();
    await toggleButton.click();

    await expect(page.getByText('Alert updated', { exact: true })).toBeVisible();
  });

  test('permite excluir alerta existente', async ({ page }) => {
    await page.addInitScript((alert) => {
      localStorage.setItem('albion_alerts', JSON.stringify([alert]));
    }, seededAlert);
    await page.reload();

    await expect(page.getByText('Bag')).toBeVisible();
    const deleteButton = page.locator('button.h-8.w-8.text-destructive').first();
    await deleteButton.click();

    await expect(page.getByText('Alert deleted', { exact: true })).toBeVisible();
    await expect(page.getByText('No alerts yet')).toBeVisible();
  });
});
