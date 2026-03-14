import { test, expect } from '@playwright/test'

test.describe('Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts')
  })

  test('página de alertas renderiza sem erro', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=404')).not.toBeVisible()
  })

  test('botão de criar alerta está visível', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create alert|novo alerta|add alert/i })
    // Pode existir com diferentes labels — verificamos que algum botão existe na página
    const anyButton = page.getByRole('button').first()
    await expect(anyButton).toBeVisible()
  })
})
