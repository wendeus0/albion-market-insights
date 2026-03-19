# QUESTIONS.md

Este arquivo consolida perguntas arquiteturais, tecnicas, de produto, seguranca, performance, manutencao e consistencia documental encontradas durante a revisao da codebase.

Objetivo: eu quero que voce responda estas perguntas neste proprio arquivo para deixar explicito o que hoje eh comportamento esperado, o que eh bug, o que eh placeholder temporario e o que deve ser refatorado.

Como responder:

- Responda abaixo de cada pergunta.
- Se algo for bug, diga explicitamente: `BUG`.
- Se algo for comportamento esperado, diga explicitamente: `ESPERADO`.
- Se algo for roadmap/placeholder, diga explicitamente: `ROADMAP` ou `PLACEHOLDER`.
- Se houver uma decisao de implementacao preferida, descreva o que deve ser feito e em qual camada.

---

## Decisoes consolidadas (2026-03-19)

- Branding unificada para `Albion Market Insights` em UI, docs e metadados.
- Fallback automatico para mock restrito a dev/test; producao deve expor estado degradado com motivo.
- `Clear All` da `PriceTable` deve ser transacional (memoria + storage) e sem regressao de persistencia.
- Consolidar sistema de toast em um unico provider/API.
- Remover uso parcial de `next-themes` enquanto nao houver estrategia completa de tema.
- Semantica de alerta `change`: variacao percentual temporal de preco (nao `spreadPercent` atual).
- Politica de frescor unificada em 15 minutos (cache + queries), mantendo refresh manual.
- Constantes operacionais centralizadas em uma fonte unica.
- Contrato de persistencia da `PriceTable`: persistir filtros + ordenacao; nao persistir paginacao.
- Dashboard deve remover aba `Local Spread` e focar em `Cross-City Arbitrage`.
- Frente mobile permanece aberta para evolucao (PWA e/ou app nativo) sem bloquear o roadmap web.
- Refresh manual permitido 1x a cada 5 minutos por cliente.
- Protecao global de API: adicionar camada central (proxy/backend) com cache compartilhado e rate limit para evitar estouro sob concorrencia de usuarios.
- Historico de precos: alvo final aprovado eh historico por qualidade.
- Modelo de arbitragem atual permanece no curto prazo, mas deve ser rotulado como estimativa (tax-only) e evoluir por fases com custos de rota/risco.
- IDs de alerta devem migrar para `crypto.randomUUID()` com fallback seguro.
- Cooldown de notificacao deve sobreviver a reload (persistencia com TTL curto por alerta).
- `alert.city` deve usar contrato restritivo e valor canonico (`all`), com label de UI desacoplada.
- `useToast` custom deve ser descontinuado apos migracao para um unico sistema de notificacao (Sonner + wrapper interno).
- `quality:gate` deve incluir `typecheck` explicito e smoke E2E obrigatorio no CI.
- Cobertura deve ter threshold oficial versionado com enforcement no CI.
- Baseline de runtime deve ser Node 20, com documentacao alinhada.
- Documentacao arquitetural deve ser sincronizada (CONTEXT e ADRs) com estado real da codebase e CI.
- Dashboard deve ter foco unico em arbitragem e sem placeholders de metricas locais.
- Feature futura registrada: sistema de temas (light/dark/system) com `ThemeProvider` completo, somente quando houver SPEC dedicada.

## 1. Produto, naming e comportamento esperado

### Q01. Qual eh o nome oficial do produto: `Albion Market Insights` ou `Albion Market Tracker`?

- Arquivos: `README.md`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/pages/About.tsx`, `package.json`
- Observacao: a documentacao principal usa `Albion Market Insights`, mas a UI ainda exibe `Albion Market Tracker`, e o `package.json` ainda usa `vite_react_shadcn_ts`.

### Q02. O nome tecnico do pacote deve continuar generico (`vite_react_shadcn_ts`) ou devemos alinhar com o nome real do projeto?

- Arquivos: `package.json`, `package-lock.json`
- Observacao: isso impacta consistencia, DX e rastreabilidade em logs, CI e publicacao futura.

### Q03. Os botoes `Sign In` e `Get Started` sao placeholders aceitos em producao ou faltam fluxos reais?

- Arquivos: `src/components/layout/Navbar.tsx`
- Observacao: hoje sao CTAs sem destino real.

### Q04. Os links `GitHub`, `Contact` e `Privacy` com `href="#"` devem continuar como placeholders ou precisam de destinos reais?

- Arquivos: `src/components/layout/Footer.tsx`
- Observacao: no estado atual, a UX termina em dead ends.

### Q05. A pagina `About` esta descrevendo fatos reais do produto ou ainda contem marketing placeholder?

- Arquivos: `src/pages/About.tsx`
- Observacao: frases como "Join thousands of Albion players" e o roadmap podem nao refletir o estado real do projeto.

### Q06. A UI final do produto deve ser em ingles, em portugues ou bilingue?

- Arquivos: `src/pages/About.tsx`, `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`, `src/components/alerts/AlertsManager.tsx`, documentacao em `README.md` e `CONTEXT.md`
- Observacao: ha mistura forte entre docs em portugues e produto em ingles.

### Q07. A condicao de alerta `change` significa variacao temporal de preco ou apenas `spreadPercent` atual?

- Arquivos: `src/components/alerts/AlertsManager.tsx`, `src/services/alert.engine.ts`, `src/lib/schemas.ts`, `src/data/types.ts`
- Observacao: a UI promete "price change", mas a engine dispara com base em `item.spreadPercent`.

### Q08. Para alertas em `All Cities`, qual deve ser a regra correta de disparo?

- Arquivos: `src/services/alert.engine.ts`, `src/components/alerts/AlertsManager.tsx`
- Observacao: hoje `items.find(...)` pega o primeiro item que bater, o que faz o resultado depender da ordem do array, nao de uma regra de negocio explicita.

### Q09. O canal `Email notification` eh funcional planejado, placeholder de UI ou bug de produto?

- Arquivos: `src/components/alerts/AlertsManager.tsx`, `src/hooks/useAlertPoller.ts`, `src/data/types.ts`
- Observacao: a UI permite marcar email, o dado eh persistido, mas nao existe infraestrutura de envio.

### Q10. A opcao `notifications.inApp` deve ser respeitada pelo poller ou todo alerta ativo deve notificar sempre em app?

- Arquivos: `src/components/alerts/AlertsManager.tsx`, `src/hooks/useAlertPoller.ts`
- Observacao: hoje o poller nao considera `notifications.inApp`.

### Q11. O item selector de alertas limitar a 20 itens unicos por `itemName` eh intencional?

- Arquivos: `src/components/alerts/AlertsManager.tsx`
- Observacao: com o catalogo expandido, isso pode ocultar boa parte dos itens disponiveis.

### Q12. A persistencia de filtros deve incluir apenas filtros numericos/seletivos ou tambem busca, ordenacao e paginacao?

- Arquivos: `src/components/dashboard/PriceTable.tsx`, `src/services/filter.storage.ts`
- Observacao: hoje parte do estado persiste e parte nao, sem criterio documentado.

---

## 2. Frontend, UX e estado da interface

### Q13. O `QueryClient` deveria ter configuracao global explicita conforme a ADR ou a decisao mudou?

- Arquivos: `src/App.tsx`, `src/main.tsx`, `docs/adr/ADR-002-tanstack-query-server-state.md`
- Observacao: a ADR fala em configuracao global, mas hoje existe apenas `new QueryClient()` sem `defaultOptions`.

### Q14. O app precisa mesmo manter dois sistemas de toast ao mesmo tempo?

- Arquivos: `src/App.tsx`, `src/hooks/use-toast.ts`, `src/components/ui/toaster.tsx`, `src/components/ui/sonner.tsx`, `src/hooks/useAlertPoller.ts`
- Observacao: `useToast` e `sonner` coexistem, aumentando complexidade e risco de inconsistencia visual/comportamental.

### Q15. O componente `src/components/ui/sonner.tsx` esta correto sem nenhum `ThemeProvider` no app?

- Arquivos: `src/components/ui/sonner.tsx`, `src/App.tsx`
- Observacao: `useTheme()` vem de `next-themes`, mas nao encontrei provider correspondente na arvore.

### Q16. O `useAlertPoller()` deve ficar montado em todas as rotas, inclusive `About` e `NotFound`?

- Arquivos: `src/App.tsx`, `src/hooks/useAlertPoller.ts`
- Observacao: isso dispara consultas/polling globalmente mesmo quando a tela atual nao precisa desse comportamento.

### Q17. O comportamento atual de `Clear All` na `PriceTable` esta correto?

- Arquivos: `src/components/dashboard/PriceTable.tsx`
- Observacao: `clearAllFilters()` seta `shouldPersist` para `false`, mas esse flag nunca volta para `true`; em leitura fria isso parece fazer com que novos filtros deixem de ser persistidos.

### Q18. Podemos fazer leitura e limpeza de `localStorage` no corpo do componente durante render?

- Arquivos: `src/components/dashboard/PriceTable.tsx`, `src/services/filter.storage.ts`
- Observacao: `filterStorage.getFilters()` eh chamado na render e pode executar `localStorage.removeItem(...)` em caso de dado invalido.

### Q19. A `PriceTable` deve resetar `currentPage` quando filtros ou ordenacao mudarem?

- Arquivos: `src/components/dashboard/PriceTable.tsx`
- Observacao: o usuario pode aplicar um filtro e permanecer preso numa pagina vazia se estava numa pagina alta antes da filtragem.

### Q20. A `PriceTable` deveria validar relacoes como `min > max` antes de aplicar o filtro?

- Arquivos: `src/components/dashboard/PriceTable.tsx`
- Observacao: hoje nao ha validacao de combinacoes invalidas de filtros numericos.

### Q21. O valor `Avg. Spread = 18.5%` e o `trend = 2.3` do Dashboard sao placeholders temporarios ou metricas reais?

- Arquivos: `src/pages/Dashboard.tsx`
- Observacao: esses numeros parecem hardcoded no modo `local`.

### Q22. O `Index` deve realmente recalcular arbitragem localmente e ainda usar fallback com `buildCrossCityArbitrage(topItems)`?

- Arquivos: `src/pages/Index.tsx`, `src/lib/arbitrage.ts`, `src/hooks/useTopProfitable.ts`
- Observacao: isso mistura dois conjuntos de dados com semanticas diferentes e pode produzir preview inconsistente.

### Q23. A `ArbitrageTable` deveria ter paginacao, persistencia ou virtualizacao como a `PriceTable`?

- Arquivos: `src/components/dashboard/ArbitrageTable.tsx`
- Observacao: com catalogo maior e encantamentos, a tabela pode crescer bastante e hoje renderiza tudo de uma vez.

### Q24. O `TopItemsPanel` esta com key suficientemente unica?

- Arquivos: `src/components/dashboard/TopItemsPanel.tsx`
- Observacao: hoje a key eh apenas `item.itemId`; se houver o mesmo item em mais de uma cidade/qualidade, pode haver colisoes de reconciliacao.

### Q25. Cada pagina deve continuar aplicando `Layout` manualmente ou vale migrar para um route layout compartilhado?

- Arquivos: `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Alerts.tsx`, `src/pages/About.tsx`, `src/components/layout/Layout.tsx`, `src/App.tsx`
- Observacao: hoje a casca de layout esta repetida na borda de cada pagina.

### Q26. `NavLink.tsx` e `use-mobile.tsx` ainda fazem parte da arquitetura ativa ou sao sobras de scaffolding?

- Arquivos: `src/components/NavLink.tsx`, `src/hooks/use-mobile.tsx`
- Observacao: parecem codigo morto ou pouco integrado.

---

## 3. Dados, dominio e camada de servicos

### Q27. Qual eh a politica oficial de frescor dos dados: 5 minutos ou 15 minutos?

- Arquivos: `src/services/market.cache.ts`, `src/hooks/useMarketItems.ts`, `src/hooks/useTopProfitable.ts`, `src/hooks/useLastUpdateTime.ts`, `docs/adr/ADR-007-market-data-cache-ttl-localstorage.md`
- Observacao: o cache local expira em 5 minutos, mas as queries ficam fresh por 15 minutos.

### Q28. Qual deve ser a fonte de verdade de `Last Update`?

- Arquivos: `src/services/market.api.ts`, `src/hooks/useLastUpdateTime.ts`, `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`
- Observacao: `cachedLastUpdate` nasce com `new Date().toISOString()` mesmo antes do primeiro fetch real; isso pode exibir horario enganoso.

### Q29. Em modo API real, eh aceitavel cair silenciosamente para mock quando a API falha?

- Arquivos: `src/services/market.api.ts`, `src/services/index.ts`, `src/services/market.mock.ts`
- Observacao: essa escolha mascara falhas externas e pode fazer o usuario achar que esta vendo dado real.

### Q30. A URL da API deveria ser configuravel por ambiente?

- Arquivos: `src/services/market.api.ts`, `.env.example`
- Observacao: `BASE_URL` e `HISTORY_URL` estao hardcoded no codigo.

### Q31. O historico de precos deve respeitar qualidade (`quality`) ou a regra correta eh usar sempre `qualities=1`?

- Arquivos: `src/services/market.api.ts`, `src/services/market.api.types.ts`, `src/data/types.ts`
- Observacao: o fetch de precos considera qualidades 1..5, mas o historico usa apenas qualidade 1 e depois eh anexado por `itemId|city`.

### Q32. Na deduplicacao dos registros da API, deve vencer a primeira ocorrencia ou o registro mais recente/mais confiavel?

- Arquivos: `src/services/market.api.ts`
- Observacao: hoje a regra eh `first occurrence wins`, mas isso pode descartar dados melhores sem criterio explicito.

### Q33. A regra de arbitragem atual esta simplificada demais para o dominio real?

- Arquivos: `src/lib/arbitrage.ts`
- Observacao: hoje o calculo considera apenas taxa de mercado (`MARKET_TAX_RATE = 0.065`) e ignora transporte, risco, peso, black market e custo operacional.

### Q34. O algoritmo de arbitragem atual tem limite de escala aceitavel para a evolucao planejada do catalogo?

- Arquivos: `src/lib/arbitrage.ts`, `src/data/constants.ts`
- Observacao: ele faz comparacoes `O(n^2)` por grupo de item/qualidade.

### Q35. `ITEM_CATALOG`, `ITEM_IDS`, `ITEM_NAMES` e labels derivados continuarao sendo mantidos manualmente?

- Arquivos: `src/data/constants.ts`, `src/services/market.api.ts`
- Observacao: o catalogo virou uma fonte de verdade grande e manual; isso pode derivar facilmente do dominio real do jogo.

### Q36. O service selector via singleton em `services/index.ts` eh suficiente para o longo prazo?

- Arquivos: `src/services/index.ts`, `src/services/market.service.ts`
- Observacao: a escolha entre mock e API real acontece no import-time, o que dificulta mudancas dinamicas e composicao mais testavel.

### Q37. O `getTopProfitable()` deveria operar em cima de uma fonte pre-processada compartilhada em vez de refazer parte do fluxo?

- Arquivos: `src/services/market.api.ts`, `src/hooks/useTopProfitable.ts`, `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`
- Observacao: ha duplicacao de trabalho e possivel divergencia entre telas.

### Q38. A semantica de `priceHistory` deveria ser opcional em `MarketItem`?

- Arquivos: `src/data/types.ts`, `src/services/market.api.ts`, `src/services/market.mock.ts`
- Observacao: o tipo exige `priceHistory: number[]`, mas o pipeline trata historico como enriquecimento best-effort.

---

## 4. Persistencia, alertas e consistencia de contratos

### Q39. A politica para dados invalidos em `localStorage` deve ser consistente entre alertas e filtros?

- Arquivos: `src/services/alert.storage.ts`, `src/services/filter.storage.ts`
- Observacao: filtros limpam storage corrompido; alertas apenas ignoram os itens invalidos e nao saneiam o storage.

### Q40. O schema persistido de `alert.city` deveria ser mais restritivo?

- Arquivos: `src/lib/schemas.ts`, `src/data/types.ts`, `src/services/alert.engine.ts`
- Observacao: `alertSchema.city` aceita qualquer string, embora o dominio aparente ser `cities` + `All Cities`.

### Q41. O uso de `Date.now().toString()` como id de alerta eh suficiente?

- Arquivos: `src/components/alerts/AlertsManager.tsx`, `src/services/alert.storage.ts`
- Observacao: colisao por duplo clique/tab simultanea eh improvavel, mas nao impossivel.

### Q42. O cooldown de notificacao precisa sobreviver a reload de pagina ou ele deve mesmo ser apenas em memoria de sessao?

- Arquivos: `src/hooks/useAlertPoller.ts`
- Observacao: hoje um reload pode reabilitar notificacoes do mesmo alerta imediatamente.

### Q43. O comportamento de `AlertStorageService.deleteAlert()` deve remover a chave inteira quando a lista fica vazia?

- Arquivos: `src/services/alert.storage.ts`
- Observacao: hoje sempre grava `[]`, diferentemente do storage de filtros que remove a chave.

### Q44. A string especial `All Cities` deveria existir na camada persistida ou precisamos normalizar isso em uma enum/union mais clara?

- Arquivos: `src/components/alerts/AlertsManager.tsx`, `src/services/alert.engine.ts`, `src/lib/schemas.ts`, `src/data/types.ts`
- Observacao: formulario usa `all`, persistencia usa `All Cities` e engine depende dessa string exata.

### Q45. O item name salvo no alerta deveria ser recalculado em runtime ou persistido como snapshot historico mesmo se o catalogo mudar?

- Arquivos: `src/components/alerts/AlertsManager.tsx`, `src/services/alert.storage.ts`
- Observacao: hoje o nome eh persistido como string fixa no momento da criacao.

---

## 5. Arquitetura, manutencao e refatoracao

### Q46. O projeto quer continuar com grande parte do pacote shadcn/ui no repositorio mesmo sem uso real da maioria dos componentes?

- Arquivos: `src/components/ui/*`, `package.json`
- Observacao: ha bastante codigo vendor no repo, o que aumenta area de manutencao, lint warnings e ruido de revisao.

### Q47. Os warnings permanentes de `react-refresh/only-export-components` em `src/components/ui/*` sao excecao oficial ou devem ser eliminados?

- Arquivos: `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/form.tsx`, `src/components/ui/navigation-menu.tsx`, `src/components/ui/sidebar.tsx`, `src/components/ui/sonner.tsx`, `src/components/ui/toggle.tsx`
- Observacao: o CI passa com warnings, mas o ruido e recorrente.

### Q48. O hook `useToast()` precisa ser mantido como implementacao customizada ou deve ser substituido por um unico sistema de notificacao?

- Arquivos: `src/hooks/use-toast.ts`
- Observacao: alem da duplicidade com Sonner, o `useEffect` depende de `state`, o que sugere re-subscribe a cada atualizacao.

### Q49. Queremos extrair regras de negocio da `PriceTable` para hooks/servicos puros?

- Arquivos: `src/components/dashboard/PriceTable.tsx`
- Observacao: o componente concentra filtros, sorting, paginacao, persistencia e formatacao numa unica unidade bem grande.

### Q50. Queremos extrair regras de negocio da `AlertsManager` para hooks/servicos puros?

- Arquivos: `src/components/alerts/AlertsManager.tsx`
- Observacao: o componente mistura formulario, normalizacao de dados, estrategia de ids, feedback de toast e renderizacao.

### Q51. O `About` deve continuar como pagina estatica codificada manualmente ou virar conteudo derivado de docs/config?

- Arquivos: `src/pages/About.tsx`
- Observacao: hoje ele concentra muita narrativa de produto que pode divergir rapidamente da implementacao real.

### Q52. Existe uma decisao intencional para manter `Layout`, `Navbar` e `Footer` sem testes diretos?

- Arquivos: `src/components/layout/Layout.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`
- Observacao: sao elementos centrais de navegacao/branding e hoje a cobertura parece majoritariamente indireta.

---

## 6. Testes, CI e qualidade tecnica

### Q53. O `quality:gate` deveria executar `tsc --noEmit` explicitamente?

- Arquivos: `package.json`, `.github/workflows/quality-gate.yml`
- Observacao: `vite build` nao substitui plenamente um typecheck dedicado.

### Q54. O CI deveria executar E2E pelo menos em `pull_request` ou em algum workflow separado obrigatorio?

- Arquivos: `.github/workflows/quality-gate.yml`, `playwright.config.ts`, `docs/adr/ADR-005-playwright-e2e-testing.md`
- Observacao: a suite E2E existe, mas o gate atual nao a usa.

### Q55. Qual eh a politica oficial de threshold de coverage?

- Arquivos: `vite.config.ts`, `package.json`
- Observacao: a cobertura eh gerada, mas nao ha thresholds tecnicos configurados no tooling.

### Q56. A suite atual precisa de testes diretos para `useTopProfitable`, `useLastUpdateTime` e `filter.storage.ts`?

- Arquivos: `src/hooks/useTopProfitable.ts`, `src/hooks/useLastUpdateTime.ts`, `src/services/filter.storage.ts`
- Observacao: essas areas parecem depender mais de cobertura indireta do que de testes dedicados.

### Q57. O poller global de alertas precisa de testes de navegacao/roteamento para garantir que nao roda em contexto indevido?

- Arquivos: `src/App.tsx`, `src/hooks/useAlertPoller.ts`, `src/test/App.test.tsx`
- Observacao: a cobertura atual parece mais focada no hook isolado do que no comportamento global da montagem.

### Q58. A porta oficial de desenvolvimento/teste eh `8080` ou `5173`?

- Arquivos: `vite.config.ts`, `playwright.config.ts`, `docs/adr/ADR-005-playwright-e2e-testing.md`
- Observacao: o codigo usa `8080`, mas alguns docs antigos ainda mencionam `5173`.

### Q59. O baseline suportado eh Node 18+ ou Node 20?

- Arquivos: `README.md`, `package.json`, `.github/workflows/quality-gate.yml`
- Observacao: o README fala em `v18+`, mas o CI fixa Node 20 e npm 10.8.2.

### Q60. Devemos incluir config files TypeScript da toolchain no typecheck formal?

- Arquivos: `tsconfig.node.json`, `playwright.config.ts`, `vite.config.ts`, `tailwind.config.ts`
- Observacao: nem toda a superficie relevante da toolchain parece coberta por um check TS explicito.

---

## 7. Documentacao e drift entre docs e codigo

### Q61. `CONTEXT.md` deve ser atualizado para refletir `strict: true` ja consolidado?

- Arquivos: `CONTEXT.md`, `tsconfig.json`, `tsconfig.app.json`, `docs/adr/ADR-006-typescript-strict-mode-gradual-migration.md`
- Observacao: ele ainda afirma `TypeScript | Sem strict mode`.

### Q62. `CONTEXT.md` deve ser atualizado para refletir o estado atual do projeto e nao um snapshot antigo de marco anterior?

- Arquivos: `CONTEXT.md`, `memory/MEMORY.md`, `PENDING_LOG.md`
- Observacao: ele ainda fala em "proximo passo: SPEC formal da integracao API e expansao do catalogo", algo ja superado.

### Q63. A ADR-003 deve ser corrigida para apontar `market.service.ts` como fonte do contrato, e nao `index.ts`?

- Arquivos: `docs/adr/ADR-003-market-service-interface-feature-flag.md`, `src/services/market.service.ts`, `src/services/index.ts`
- Observacao: ha drift documental claro.

### Q64. A ADR-005 precisa ser atualizada com a contagem real da suite, porta correta e estrategia atual de Chromium do sistema?

- Arquivos: `docs/adr/ADR-005-playwright-e2e-testing.md`, `playwright.config.ts`
- Observacao: os detalhes atuais de execucao parecem mais avancados do que a ADR documenta.

### Q65. O `README.md` deve mencionar que `quality:gate` hoje nao roda E2E nem typecheck explicito?

- Arquivos: `README.md`, `package.json`, `.github/workflows/quality-gate.yml`
- Observacao: hoje o texto pode induzir uma expectativa mais ampla do que o comando realmente faz.

---

## 8. Seguranca, operacao e higiene do repositorio

### Q66. A estrategia de fallback silencioso para mock em caso de erro da API precisa de algum aviso visual/logico para evitar decisao de negocio com dado incorreto?

- Arquivos: `src/services/market.api.ts`, `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`
- Observacao: sob falha externa, o usuario pode continuar vendo valores plausiveis sem saber que saiu do modo real.

### Q67. Existe intencao de versionar ou publicar artefatos de `dist/` em algum fluxo futuro?

- Arquivos: `.gitignore`, pasta `dist/`
- Observacao: a pasta existe localmente apesar de estar ignorada; isso merece uma politica clara de higiene.

### Q68. A dependencia `next-themes` deve permanecer se nao houver estrategia real de tema?

- Arquivos: `package.json`, `src/components/ui/sonner.tsx`
- Observacao: hoje parece existir dependencia e uso parcial, mas nao a infraestrutura completa.

### Q69. O projeto precisa de alguma sinalizacao formal quando a app esta em modo mock vs modo API real?

- Arquivos: `src/services/index.ts`, `README.md`, `.env.example`, telas `Index`/`Dashboard`
- Observacao: isso afeta confianca do usuario e debug operacional.

### Q70. Existe alguma exigencia de privacidade/retemcao para dados salvos em `localStorage` (alertas, filtros, cache) ou o comportamento atual eh suficiente para o produto?

- Arquivos: `src/services/alert.storage.ts`, `src/services/filter.storage.ts`, `src/services/market.cache.ts`, `src/components/layout/Footer.tsx`
- Observacao: o app persiste bastante estado local, mas nao encontrei politica explicita sobre isso.
