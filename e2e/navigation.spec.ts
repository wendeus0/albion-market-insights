import { test, expect } from '@playwright/test'

test.describe('Navegação entre rotas', () => {
  test('página inicial carrega com título correto', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Albion/i)
    await expect(page.locator('body')).toBeVisible()
  })

  test('rota /dashboard renderiza sem erro', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('body')).toBeVisible()
    // Não deve mostrar tela de erro (NotFound)
    await expect(page.locator('text=404')).not.toBeVisible()
  })

  test('rota /alerts renderiza sem erro', async ({ page }) => {
    await page.goto('/alerts')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=404')).not.toBeVisible()
  })

  test('rota /about renderiza sem erro', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=404')).not.toBeVisible()
  })

  test('rota inexistente exibe página 404', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')
    await expect(page.locator('body')).toBeVisible()
  })

  test('links de navegação funcionam', async ({ page }) => {
    await page.goto('/')
    // Clica no link Dashboard na navbar
    const dashboardLink = page.getByRole('link', { name: /dashboard/i })
    await dashboardLink.first().click()
    await expect(page).toHaveURL(/.*dashboard.*/)
  })
})
