---
id: fix-oauth-pkce-flow
type: fix
summary: Corrigir fluxo OAuth PKCE e redirect de login para usuarios autenticados
status: approved
created: 2026-03-29
---

# SPEC — Fix OAuth PKCE Flow

## Contexto e Motivacao

O PR #96 (`feat/discord-oauth-bot`) introduziu um bug critico no fluxo de autenticacao:

1. **Login OAuth redireciona para `/login` com erro** "Login cancelado" apos autenticacao bem-sucedida no Discord
2. **Sessao inconsistente** - usuario autenticado fica preso na tela de login
3. **Edge Function retorna 401 Invalid JWT** ao tentar vincular Discord

## Causa Raiz

O cliente Supabase esta configurado com **implicit flow** (padrao), mas o callback espera **PKCE flow**:

| Arquivo                            | Problema                                                         |
| ---------------------------------- | ---------------------------------------------------------------- |
| `src/lib/supabase.ts:7`            | `createClient(url, anonKey)` sem `flowType: "pkce"`              |
| `src/pages/AuthCallback.tsx:17-39` | Espera `?code=` do PKCE, mas recebe `#access_token=` do implicit |
| `src/pages/Login.tsx`              | Nao redireciona usuarios autenticados para `/alerts`             |

**Fluxo esperado (PKCE):**

```
Discord → Supabase → /auth/callback?code=XXX → exchangeCodeForSession() → /alerts
```

**Fluxo atual (Implicit):**

```
Discord → Supabase → /auth/callback#access_token=XXX → sem code → redirect /login
```

## Fora do Escopo

- Mudancas no backend
- Mudancas no Discord Developer Portal (redirect_uri ja corrigido)
- Mudancas no Supabase Dashboard
- Funcionalidade de vinculo de bot

## Criterios de Aceitacao

### AC-1 — Cliente Supabase usa PKCE

**Given** o cliente Supabase em `src/lib/supabase.ts`
**When** inicializado
**Then** configura `flowType: "pkce"` para alinhar com o callback

### AC-2 — Login redireciona usuarios autenticados

**Given** um usuario ja autenticado
**And** acessa `/login`
**Then** redireciona automaticamente para `/alerts`

### AC-3 — Callback processa code PKCE

**Given** OAuth retorna com `?code=xxx`
**When** o callback processa
**Then** `exchangeCodeForSession(code)` cria sessao
**And** usuario e redirecionado para `/alerts`

### AC-4 — Fluxo end-to-end funciona

**Given** usuario nao autenticado
**When** clica "Entrar com Discord"
**And** autoriza no Discord
**Then** sessao e criada corretamente
**And** usuario e redirecionado para `/alerts`
**And** pode clicar "Vincular Discord" sem erro 401

## Casos de Erro

- OAuth cancelado → redirect `/login` com mensagem amigavel (ja existe)
- OAuth falha → redirect `/login` com mensagem amigavel (ja existe)
- Sessao invalida → usuario permanece deslogado (comportamento atual)

## Dependencias

- Nenhuma dependencia externa nova
- Configuracao existente do Discord OAuth (redirect_uri ja corrigido)

## Riscos e Incertezas

- Testes precisam mockar `createClient` corretamente
- Redirect defensivo no Login pode interferir com fluxos de logout (testar)

## Referencias

- `src/lib/supabase.ts`
- `src/pages/AuthCallback.tsx`
- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`
- `src/test/AuthCallback.test.tsx`
- `src/test/Login.test.tsx`
- `src/test/auth.context.test.tsx`
