---
id: auth-supabase-alert-sync
type: feature
summary: Introduzir autenticacao basica com Supabase, perfil protegido e sincronizacao de alertas por usuario.
status: approved
created: 2026-03-27
---

# SPEC — Auth Supabase e Sync de Alertas

## Contexto e Motivação

A branch atual introduz autenticacao com Supabase, uma pagina de login, uma rota de perfil protegida
e sincronizacao de alertas por usuario. Esse recorte altera navegacao, persistencia e integracao externa,
entao precisa de SPEC explicita para manter escopo, criterios verificaveis e trilha de seguranca local.

## Problema a Resolver

Hoje o produto persiste alertas apenas em `localStorage` e nao distingue usuario autenticado de visitante.
Sem esse recorte formalizado, a branch acumula mudancas de auth sem contrato claro para:

- acesso a entradas de login e perfil
- protecao de rota autenticada
- sincronizacao de alertas para storage remoto por usuario
- configuracao minima de ambiente para Supabase

## Fora do Escopo

- recuperacao de senha, magic link, OAuth ou MFA
- entrega real de notificacoes Discord
- onboarding de schema/migrations do Supabase fora do contrato client-side
- mudancas em `src/components/ui/`
- cobertura E2E do fluxo completo de signup/login real contra backend remoto

## Critérios de Aceitação

### AC-1 — Visitante ve caminhos de autenticacao sem perder acesso ao app

**Given** que o usuario nao esta autenticado
**When** acessa navegacao principal ou a pagina de alertas
**Then** a UI exibe entradas para login
**And** a pagina de alertas mostra um banner orientando a sincronizacao na nuvem

### AC-2 — Rota protegida redireciona visitante para login

**Given** que o usuario nao esta autenticado
**When** acessa `/profile`
**Then** a aplicacao redireciona para `/login`
**And** nao renderiza o conteudo protegido antes do fim do carregamento inicial

### AC-3 — Sessao autenticada troca o storage de alertas para Supabase

**Given** que uma sessao valida existe
**When** `useAuthSync` observa o usuario autenticado
**Then** o `marketService` passa a usar `SupabaseAlertStorageService`
**And** alertas locais existentes sao migrados em modo best-effort apenas uma vez por usuario

### AC-4 — Perfil do usuario usa tabela `profiles`

**Given** que o usuario autenticado acessa `/profile`
**When** a pagina carrega e o formulario eh salvo
**Then** o app le e atualiza `discord_webhook_url` na tabela `profiles`
**And** exibe feedback visual de sucesso ou erro

### AC-5 — Regressao controlada da frente

**Given** que a feature foi integrada ao app
**When** as validacoes locais forem executadas
**Then** `npm run quality:gate` passa sem erros
**And** um teste de integracao/E2E cobre pelo menos o acesso visitante a rota protegida

## Casos de Erro

- Sem sessao autenticada, `/profile` deve redirecionar para `/login`
- Falha de leitura do perfil deve degradar para estado vazio, sem crash
- Falha individual na migracao de um alerta local nao deve interromper a migracao dos demais
- Falha de persistencia do perfil deve exibir feedback de erro ao usuario

## Dependências

- `@supabase/supabase-js`
- variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuthSync.ts`
- `src/hooks/useProfile.ts`
- `src/services/alert.storage.supabase.ts`

## Riscos e Incertezas

- Ausencia de env valida pode quebrar o bootstrap do client de auth em ambientes sem configuracao
- A migracao local para remoto e best-effort; sem observabilidade adicional, falhas parciais podem passar despercebidas
- O fluxo de auth real depende de contratos externos do Supabase nao versionados neste repositorio

## Referências

- `src/App.tsx`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuthSync.ts`
- `src/hooks/useProfile.ts`
- `src/services/alert.storage.supabase.ts`
- `src/pages/Login.tsx`
- `src/pages/Profile.tsx`
