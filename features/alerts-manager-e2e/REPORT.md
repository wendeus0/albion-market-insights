# REPORT — Cobertura E2E do AlertsManager

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-18
**Feature:** alerts-manager-e2e

---

## 1. Objetivo da Mudança

Cobrir em browser real os fluxos principais do `AlertsManager` que não eram confiavelmente testáveis em unit tests com jsdom, especialmente criação, persistência, toggle e exclusão de alertas.

## 2. Escopo Alterado

### Arquivos alterados
- `e2e/alerts.spec.ts` — ampliação da suíte E2E de alertas com 4 cenários principais do fluxo feliz
- `playwright.config.ts` — configuração condicional para usar `/usr/bin/chromium` no Arch Linux e forçar `VITE_USE_REAL_API=false` no webServer E2E
- `features/alerts-manager-e2e/SPEC.md` — SPEC da frente

## 3. Validações executadas

### quality-gate
- `npm run lint` → sem erros; apenas warnings já conhecidos de vendor/coverage
- `npm run build` → OK
- `npm run test:e2e -- e2e/alerts.spec.ts` → 9/9 passando

**Resultado:** `QUALITY_PASS`

### security-review
- `SKIPPED` — justificativa: mudança restrita a testes E2E e configuração de browser/runtime local do Playwright; não toca auth, secrets, CI/CD remoto, infra produtiva ou APIs públicas.

### code-review
- `REVIEW_OK_WITH_NOTES`
- Nota: há duplicação aceitável entre cenários E2E; se a suíte crescer, extrair helpers locais para criação/seed de alertas.

## 4. Cenários cobertos

- abertura do dialog de criação
- fechamento via `Cancel`
- validação de formulário vazio
- estado vazio sem alertas
- criação de alerta válido com feedback visual
- persistência do alerta após reload
- toggle de status de alerta existente
- exclusão de alerta existente

## 5. Riscos residuais

- A suíte depende de `chromium` instalado no sistema em ambientes Arch locais; o config usa fallback condicional para não quebrar CI Ubuntu.
- Os cenários ainda não cobrem disparo real do polling/engine de alertas, apenas CRUD e feedback do `AlertsManager`.

## 6. Follow-ups

1. Cobrir fluxo E2E de disparo do alerta quando o motor detectar condição satisfeita.
2. Se a suíte de alertas crescer, extrair helpers para criação e seed de alertas em `e2e/alerts.spec.ts`.

## 7. Conclusão

A frente atinge o objetivo: os fluxos que estavam bloqueando a cobertura efetiva do `AlertsManager` agora são validados via Playwright em browser real, com persistência em `localStorage` e feedback visual cobertos.
