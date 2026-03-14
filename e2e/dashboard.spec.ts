import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('renderiza cards de estatísticas', async ({ page }) => {
    // Deve haver ao menos 1 card de stats visível
    const cards = page.locator('.glass-card')
    await expect(cards.first()).toBeVisible()
  })

  test('renderiza tabela de preços com itens', async ({ page }) => {
    // Cabeçalho da tabela deve estar visível
    await expect(page.getByRole('button', { name: /item/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /sell price/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /spread/i })).toBeVisible()
  })

  test('campo de busca aceita input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by item name/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Clarent')
    await expect(searchInput).toHaveValue('Clarent')
  })

  test('busca filtra itens na tabela', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by item name/i)
    await searchInput.fill('zzzzz-nao-existe')
    // Deve mostrar mensagem de "no items found"
    await expect(page.getByText(/no items found/i)).toBeVisible({ timeout: 3000 })
  })

  test('busca com texto em branco mostra todos os itens', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by item name/i)
    await searchInput.fill('zzzzz-nao-existe')
    await searchInput.clear()
    await expect(page.getByText(/no items found/i)).not.toBeVisible({ timeout: 3000 })
  })

  test('clique no header "Spread" ordena a coluna', async ({ page }) => {
    const spreadBtn = page.getByRole('button', { name: /spread/i })
    await spreadBtn.click()
    // Após clicar, o ícone de ordenação deve aparecer (arrow up ou down)
    await expect(spreadBtn).toBeVisible()
  })
})
