# ADR-005 — Playwright para testes E2E

Status: Aceito
Data: 2026-03-16
Última revisão: 2026-03-20

## Contexto

Testes unitários cobrem lógica isolada, mas não garantem fluxos reais de navegação, integração de rotas e comportamento em browser.

Era necessário um guard-rail de integração no CI para detectar regressões entre páginas e ações principais do usuário.

## Decisão

Adotar Playwright para testes E2E com suíte em `e2e/`.

No CI, usar abordagem em duas camadas:
- Smoke E2E obrigatório no quality gate (`npm run test:e2e:smoke`)
- Suíte E2E completa disponível para execução dedicada quando necessário

A execução de CI usa modo determinístico (sem obrigatoriedade de API real) para reduzir flakiness.

## Consequências

- Regressões de navegação e fluxo crítico são detectadas no pipeline padrão.
- Tempo de CI permanece controlado com smoke em vez de suíte completa em toda execução.
- Continua necessário instalar browser do Playwright nos jobs que rodam E2E.
- Para investigação profunda, suíte completa pode ser acionada fora do caminho crítico.

## Relação com runtime/CI

Com Node 24 em observação paralela, o smoke E2E no quality gate ajuda a comparar estabilidade entre lanes sem inflar custo do pipeline.

## Alternativas consideradas

- Rodar suíte E2E completa em todo PR: maior custo/latência e menor produtividade.
- Manter apenas unit/integration: não cobre problemas reais de navegação e integração de rotas.
- Testes manuais: baixa repetibilidade e maior chance de regressão escapar.

