# PENDING_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Decisões incorporadas

- **Ativação da API Real**: O ambiente foi configurado para usar a API real (`VITE_USE_REAL_API=true`) no arquivo `.env`, substituindo o mock data padrão.
- **Teste de integração**: Validado que `market.api.ts` é carregado quando a variável de ambiente está ativa.
- **Debug logging removido** (2026-03-16): `console.log/warn/error` removidos de `market.api.ts` e `NotFound.tsx`; testes adicionados para garantir ausência. Commit `ad190a2` em `main`.
- **ANALYSIS_REPORT.md gerado** (2026-03-16): codebase-analysis completa; relatório em raiz do projeto com 11 débitos classificados (P0/P1/P2).

## Pendências

- [ ] **ADR-004 ausente**: Decisão de localStorage para alertas documentada em MEMORY.md mas sem arquivo formal em `docs/adr/`. Usar `adr-manager`. Esforço: XS.
- [ ] **Expansão do catálogo**: `src/data/constants.ts` contém apenas ~50 itens hardcoded. Necessário decidir: hardcoded vs. endpoint dinâmico. Criar SPEC antes de implementar.
- [ ] **Filtros de UI**: O dashboard exibe todos os itens de uma vez. Necessário adicionar filtros por Tier, Categoria e Cidade na interface.
- [ ] **Tratamento de Rate Limit**: A API pública tem limites não documentados. Implementar backoff exponencial em `market.api.ts`.
- [ ] **Working tree com mudanças não commitadas**: Arquivos de sessões anteriores (`AGENTS.md`, `CLAUDE.md`, test files, `vite.config.ts`, `docs/adr/`, `memory/`) ainda não commitados. Avaliar e commitar ou descartar antes de próxima feature.

## Pontos de atenção

- **Performance**: Com a API real, o carregamento inicial pode ser lento devido à busca de histórico para cada item em cada cidade (N itens * 7 cidades). Considerar cache com TTL em localStorage.
- **Bundle size**: 520KB minificado — Vite avisa sobre chunks grandes. Code-splitting por rota com `React.lazy()` é o próximo passo recomendado (DEBT-P1-004).
- **TypeScript strict mode desativado**: `noImplicitAny`, `strictNullChecks` e `noUnusedLocals` estão `false`. Migração gradual pendente — começar por `src/services/`.
