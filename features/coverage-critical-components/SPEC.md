---
id: coverage-critical-components
type: feature
summary: Elevar a cobertura de PriceTable e AlertsManager para pelo menos 80% com testes unitarios.
status: ready
created: 2026-03-18
---

# SPEC — Cobertura de Componentes Críticos

## Contexto

Após a conclusão dos testes E2E de alertas e da elevação de cobertura dos hooks críticos,
os principais gaps remanescentes estão em componentes de UI com comportamento relevante
para o usuário:

- `src/components/dashboard/PriceTable.tsx` com 76.61% de cobertura
- `src/components/alerts/AlertsManager.tsx` com 63.46% de cobertura

Esses componentes concentram fluxos importantes de filtragem, criação e gestão de alertas.
Sem testes unitários mais completos, mudanças futuras nesses fluxos aumentam o risco de regressão
e tornam refactors menos seguros.

## Objetivo

Adicionar testes unitários e de integração para elevar a cobertura de `PriceTable.tsx`
e `AlertsManager.tsx` para pelo menos 80%, sem alterar a interface pública dos componentes.

## Escopo

- Adicionar testes para filtros e estados relevantes de `PriceTable`
- Adicionar testes para criação, listagem, toggle e exclusão em `AlertsManager`
- Ajustar apenas suporte de testes e mocks necessários para cobrir os comportamentos esperados
- Validar a cobertura com `vitest --coverage`

## Fora do escopo

- Alterações funcionais nos componentes de produção
- Novos cenários E2E em Playwright
- Cobertura de hooks ou serviços fora do necessário para suportar os testes dos componentes
- Mudanças em `src/components/ui/`
- Hardening de `src/services/alert.storage.ts`

## Acceptance Criteria

### AC-1 — PriceTable cobre filtros avançados e estados derivados

**Given** que o `PriceTable` é renderizado com dados de mercado
**When** o usuário aplica filtros avançados e limpa os filtros
**Then** os resultados exibidos e os estados derivados do componente são validados por testes
**And** a cobertura do arquivo atinge pelo menos 80%

### AC-2 — AlertsManager cobre fluxos principais de gerenciamento

**Given** que o `AlertsManager` está renderizado com suporte de mocks adequados
**When** o usuário cria, ativa/desativa e remove alertas
**Then** os fluxos principais do componente são validados por testes
**And** a cobertura do arquivo atinge pelo menos 80%

### AC-3 — Regressão zero da suíte relevante

**Given** que os novos testes foram adicionados
**When** a suíte relevante e as validações de qualidade forem executadas
**Then** os testes novos e existentes passam sem regressões

### AC-4 — Estados sem dados e dependências simuladas permanecem cobertos

**Given** que os componentes dependem de dados, hooks e callbacks externos
**When** os testes exercitam estados vazios ou interações com mocks
**Then** os comportamentos observáveis continuam verificáveis sem alterar o código de produção

## Dependências

- Baseline atual estável em `main`
- `Vitest` e `Testing Library` já configurados no projeto
- Dados e hooks atuais de dashboard e alertas permanecem compatíveis com os componentes

## Riscos e Incertezas

- `AlertsManager` pode exigir mocks cuidadosos de hooks e toasts para evitar testes frágeis
- `PriceTable` pode ter branches condicionais dependentes de combinações específicas de filtros
- Cobertura final pode exigir pequenos ajustes de setup de teste antes de atingir o limiar alvo

## Referências

- `src/components/dashboard/PriceTable.tsx`
- `src/components/alerts/AlertsManager.tsx`
- `features/coverage-critical-modules/SPEC.md`
- `memory/MEMORY.md`
