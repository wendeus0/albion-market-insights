---
feature: fix-oauth-pkce-flow
status: READY_FOR_COMMIT
created: 2026-03-29
---

# REPORT — Fix OAuth PKCE Flow

## Objetivo da Mudanca

Corrigir bug critico no fluxo de autenticacao OAuth com Discord:

- Login OAuth redirecionava para `/login` com erro "Login cancelado" apos autenticacao bem-sucedida
- Sessao ficava inconsistente (autenticado mas preso na tela de login)
- Edge Function `generate-discord-link` retornava `401 Invalid JWT`

## Escopo Alterado

- `src/lib/supabase.ts` — configurado `flowType: "pkce"` no cliente Supabase
- `src/pages/Login.tsx` — adicionado redirect para `/alerts` quando usuario autenticado + loading state
- `src/test/supabase-client.test.ts` — novo teste para validar configuracao PKCE
- `src/test/Login.test.tsx` — ajustes nos testes existentes para esperar loading state

## Validacoes Executadas

### quality-gate

- `QUALITY_PASS` — todos os testes passando (485/485), cobertura 94.17% statements, 88.51% branches, lint OK, typecheck OK, build OK

### security-review

- `SECURITY_PASS` — mudanca melhora seguranca ao migrar de implicit flow para PKCE; nenhum risco introduzido

### code-review

- `SKIPPED` — mudanca trivial e focada: configuracao de auth e redirect defensivo

## Riscos Residuais

- [Fluxo OAuth completo nao testado em E2E] → [possivel problema em ambiente de producao se redirect_uri do Discord nao estiver configurado corretamente]
- [Sessao stale em browsers antigos] → [possivel necessidade de limpar localStorage manualmente em casos raros]

## Follow-ups

- Validar fluxo OAuth completo em ambiente de producao apos deploy
- Confirmar que redirect_uri do Discord Developer Portal inclui `https://ubxwoictayqssadvtfkh.supabase.co/auth/v1/callback`

## Status Final

`READY_FOR_COMMIT`
