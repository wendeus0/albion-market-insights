# REPORT — Factory/DI para Serviços

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-21
**Branch:** refactor/factory-di-services
**Tipo:** refactor-feature
**Referência:** P2 estrutural — reduzir acoplamento de singleton em import-time

---

## Sumário Executivo

Refatoração para introduzir injeção de dependências (DI) nos serviços de mercado, eliminando o padrão de singleton em import-time. A mudança mantém 100% de retrocompatibilidade com o código existente enquanto permite testes unitários com mocks injetados.

---

## O que mudou

### Arquivos modificados

| Arquivo                       | Mudança                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| `src/services/market.mock.ts` | Adicionado construtor com `AlertStorageService` injetável   |
| `src/services/market.api.ts`  | Adicionado construtor com dependências injetáveis           |
| `src/services/index.ts`       | Exporta `createMarketService` e mantém singleton compatível |

### Arquivos criados

| Arquivo                                | Propósito                                      |
| -------------------------------------- | ---------------------------------------------- |
| `src/services/factory.ts`              | Factory function `createMarketService(config)` |
| `src/test/factory.test.ts`             | 11 testes cobrindo AC-1 a AC-5                 |
| `features/factory-di-services/SPEC.md` | Especificação da refatoração                   |

---

## Critérios de Aceite

| AC   | Descrição                                      | Status                                               |
| ---- | ---------------------------------------------- | ---------------------------------------------------- |
| AC-1 | Injeção de dependências em ApiMarketService    | ✅ Constructor aceita `storage` e `fallback`         |
| AC-2 | Injeção de dependências em MockMarketService   | ✅ Constructor aceita `storage`                      |
| AC-3 | Factory function retorna implementação correta | ✅ 3 testes cobrindo `useRealApi` true/false/default |
| AC-4 | Testes unitários com mocks injetados           | ✅ 2 testes com mocks injetados                      |
| AC-5 | Compatibilidade com código existente           | ✅ Singleton ainda exportado                         |

---

## Validação

### Testes

```
Test Files  39 passed (39)
Tests       359 passed (359)
Duration    9.54s
```

- 348 testes existentes: **100% passando**
- 11 novos testes de factory: **100% passando**

### Quality Gate

```
✅ npm run lint   — 0 erros
✅ npm run test   — 359/359 testes
✅ npm run build  — bundle OK (396 KB)
✅ Sem console.log
✅ Imports via @/*
```

### Security Review

**Skip justificado:** Esta refatoração não toca:

- CI/CD
- Autenticação/secrets
- Infraestrutura
- APIs públicas
- Skills

---

## Riscos Residuais

| Risco                                                | Nível | Mitigação                      |
| ---------------------------------------------------- | ----- | ------------------------------ |
| Regressão em consumidores do singleton               | LOW   | Singleton mantido compatível   |
| Construtores com valores default podem mascarar erro | LOW   | Factory explicita dependências |

---

## Mudanças no Repositório

```diff
src/services/market.mock.ts
- private storage = new AlertStorageService();
+ constructor(private storage: AlertStorageService = new AlertStorageService()) {}

src/services/market.api.ts
- private storage = new AlertStorageService();
- private fallback = new MockMarketService();
+ constructor(
+   private storage: AlertStorageService = new AlertStorageService(),
+   private fallback: MarketService = new MockMarketService()
+ ) {}

src/services/index.ts
+ export { createMarketService } from './factory';
+ export const marketService: MarketService = createMarketService();

src/services/factory.ts (novo)
+ export function createMarketService(config?: MarketServiceConfig): MarketService

src/test/factory.test.ts (novo)
+ 11 testes cobrindo DI e factory
```

---

## Próximos Passos

1. Merge em `main`
2. Atualizar documentação de arquitetura em ADR se necessário
