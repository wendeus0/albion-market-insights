---
id: supabase-rls-alerts-profiles
type: feature
summary: Versionar o contrato minimo de schema e RLS para alerts e profiles no Supabase.
status: approved
created: 2026-03-27
---

# SPEC — Supabase RLS para Alerts e Profiles

## Contexto e Motivação

A frente anterior formalizou o client de autenticacao e sincronizacao de alertas, mas a seguranca
multi-tenant continua fora do repositorio. Sem schema e policies versionadas, o isolamento por usuario
fica implícito e nao auditavel.

## Problema a Resolver

Hoje nao existe no repositório nenhum artefato que defina:

- schema minimo das tabelas `profiles` e `alerts`
- vinculo dessas tabelas com `auth.users`
- politicas RLS que limitem leitura e escrita ao proprio usuario
- forma objetiva de validar localmente que esse contrato continua presente

## Fora do Escopo

- aplicar migrations em ambiente remoto
- provisionar projeto Supabase
- validar login real contra instancia hospedada
- adicionar colunas de produto fora do contrato atual do client
- criar automacao de CI para executar SQL em banco real

## Critérios de Aceitação

### AC-1 — Schema minimo de `profiles` fica versionado

**Given** que o client depende da tabela `profiles`
**When** o contrato SQL versionado for lido
**Then** a tabela `profiles` declara chave vinculada a `auth.users`
**And** expõe ao menos `id`, `discord_webhook_url` e `updated_at`

### AC-2 — Schema minimo de `alerts` fica versionado

**Given** que o client sincroniza alertas por usuario
**When** o contrato SQL versionado for lido
**Then** a tabela `alerts` declara `user_id` vinculado a `auth.users`
**And** expõe as colunas usadas pelo client para CRUD de alertas

### AC-3 — RLS restringe acesso ao proprio usuario

**Given** que `profiles` e `alerts` contem dados por usuario
**When** as policies forem definidas no contrato SQL
**Then** leitura, insercao, atualizacao e delecao ficam limitadas a `auth.uid()`

### AC-4 — Contrato permanece auditavel localmente

**Given** que a frente toca seguranca remota
**When** a suite local for executada
**Then** um teste estatico valida a presenca das tabelas e policies esperadas
**And** `npm run quality:gate` permanece verde

## Casos de Erro

- Ausencia de RLS em qualquer tabela deve falhar no teste estatico
- Ausencia de policy de delete em `alerts` deve falhar no teste estatico
- Ausencia do vinculo com `auth.users` deve falhar no teste estatico

## Dependências

- `features/auth-supabase-alert-sync/SPEC.md`
- `src/services/alert.storage.supabase.ts`
- `src/hooks/useProfile.ts`

## Riscos e Incertezas

- O schema versionado pode divergir de um projeto Supabase remoto ja existente
- O teste estatico valida contrato textual, nao execucao real das policies
- O formato JSON de `notifications` depende de compatibilidade entre app e Postgres `jsonb`

## Referências

- `src/services/alert.storage.supabase.ts`
- `src/hooks/useProfile.ts`
- `features/auth-supabase-alert-sync/REPORT.md`
