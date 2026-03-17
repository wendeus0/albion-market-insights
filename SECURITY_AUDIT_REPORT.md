# SECURITY_AUDIT_REPORT.md

**Data:** 2026-03-17
**Escopo:** Codebase inteira
**Veredito:** `SECURITY_PASS_WITH_NOTES`

## 1. Superfície de ataque mapeada

- **APIs externas**: `https://west.albion-online-data.com/api/v2/stats/prices` e `https://west.albion-online-data.com/api/v2/stats/history`
- **Entradas de usuário**: filtros do dashboard e formulários de alertas no cliente
- **Persistência client-side**: `localStorage` para alertas e cache de mercado
- **Configuração**: feature flag `VITE_USE_REAL_API`
- **Automação**: scripts locais em `package.json` para build, lint, testes unitários e E2E

## 2. Achados por severidade

### CRITICAL

- Nenhum.

### HIGH

- Nenhum.

### MEDIUM

- Nenhum.

### LOW

- **Leitura de alertas sem validação de schema** em `src/services/alert.storage.ts`: dados malformados em `localStorage` podem degradar a experiência e gerar estado inconsistente. Correção sugerida: abrir `fix-feature` para validar payload com `zod` antes de hidratar alertas.
- **Auditabilidade limitada de CI/CD**: não há workflow versionado de CI visível no repositório para inspeção direta. Não é vulnerabilidade confirmada, mas reduz rastreabilidade operacional.

## 3. Gestão de secrets

- Nenhum secret sensível identificado na codebase auditada.
- O uso de `.env` observado se limita à flag `VITE_USE_REAL_API`; não há tokens, chaves ou credenciais no fluxo atual.
- As integrações externas consumidas são públicas e read-only.

## 4. Deps com vulnerabilidades conhecidas

- Nenhuma vulnerabilidade crítica documentada no contexto atual.
- Há backlog de atualização em `ANALYSIS_REPORT.md`, mas sem evidência nesta auditoria de CVE crítico aberto.

## 5. CI/CD e automações

- Os scripts locais de qualidade (`lint`, `test`, `build`, `test:e2e`) são simples e não expõem secrets.
- O projeto mantém guardrails operacionais em `AGENTS.md`, incluindo proibição de polling agressivo à API e exigência de quality gate antes de commit.
- Como não há pipeline versionado visível, recomenda-se registrar ou publicar o fluxo real de CI quando existir.

## 6. Recomendações priorizadas

1. **P1** — Validar leitura de alertas em `src/services/alert.storage.ts` com schema defensivo antes de consumir dados persistidos (`fix-feature`).
2. **P2** — Tornar o workflow de CI auditável no repositório, caso exista fora da árvore atual.
3. **P2** — Manter monitoramento do uso da API pública para evitar regressão em backoff, timeout e volume de polling.

## 7. Próximos passos

- Abrir uma correção pequena para endurecer `alert.storage.ts`.
- Reavaliar segurança após eventual introdução de autenticação, backend próprio, webhooks ou automações de deploy.
- Revisitar a auditoria após upgrades maiores de dependências ou mudanças de infra.
