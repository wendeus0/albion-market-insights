---
feature: supabase-rls-alerts-profiles
status: READY_FOR_COMMIT
created: 2026-03-27
---

# REPORT — Supabase RLS para Alerts e Profiles

## Objetivo da Mudança

Versionar no repositorio o contrato minimo de schema e RLS para `profiles` e `alerts`,
reduzindo o gap entre o client autenticado e a seguranca efetiva dos dados remotos.

## Escopo Alterado

- SPEC da frente
- migration SQL versionada em `supabase/migrations/20260327_auth_alerts_profiles.sql`
- teste estatico do contrato de schema/RLS em `src/test/supabase.rls.contract.test.ts`

## Validações executadas

### spec-validator

- `PASS`
- Frontmatter valido
- Seções obrigatorias presentes
- Critérios verificaveis e independentes

### security-review

- `SECURITY_PASS_WITH_NOTES`
- Sem blocker no contrato SQL versionado
- Checks aplicados:
  - `profiles.id` e `alerts.user_id` vinculados a `auth.users`
  - RLS habilitada em `profiles` e `alerts`
  - policies de select/insert/update/delete limitadas a `auth.uid()`
- Nota residual:
  - o repositório agora define o contrato, mas a aderencia do ambiente remoto ainda depende da migration ser aplicada e de nao haver drift no projeto Supabase existente

### quality-gate

- `QUALITY_PASS`
- `npm run quality:gate` verde
- `51/51` arquivos de teste passando
- `455/455` testes passando

## Riscos residuais

- O teste estatico valida presenca textual do contrato SQL, nao execucao real contra banco
- Pode existir divergencia entre esta migration e um projeto Supabase remoto ja provisionado
- A frente ainda nao automatiza aplicacao/verificacao remota das policies

## Status Final

`READY_FOR_COMMIT`
