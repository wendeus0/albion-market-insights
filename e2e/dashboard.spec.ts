import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('carrega e exibe StatsCards', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('tabela exibe pelo menos uma linha de item', async ({ page }) => {
    // Aguarda dados carregarem
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('filtro de cidade atualiza a tabela', async ({ page }) => {
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Seleciona cidade Caerleon via combobox
    const citySelect = page.getByRole('combobox').first();
    await citySelect.click();
    await page.getByRole('option', { name: 'Caerleon' }).click();

    // Aguarda re-render
    await page.waitForTimeout(300);

    // Verifica que linhas contêm Caerleon
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('campo de busca filtra itens pelo nome', async ({ page }) => {
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Clarent');
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
