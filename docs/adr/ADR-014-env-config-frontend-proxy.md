# ADR-014 — Configuração de ambiente para frontend com proxy Cloudflare

**Data:** 2026-03-23
**Status:** Aceito
**Contexto:** Deploy do frontend no Cloudflare Pages com proxy Worker

---

## Contexto

O frontend usa duas flags Vite para controlar a fonte de dados:

- `VITE_USE_REAL_API` — `factory.ts` usa para decidir entre `ApiMarketService` e `MockMarketService`
- `VITE_USE_PROXY` — `market.api.ts` usa para decidir entre URL direta da Albion API e URL do Worker proxy

Ambas são injetadas em tempo de build (`import.meta.env.*`). O Cloudflare Pages injeta env vars durante o build a partir de duas fontes, em ordem de precedência:

1. **Dashboard do Pages** (Settings → Environment variables) — maior precedência
2. **`.env` commitado no repositório**

---

## Decisão

Commitar o `.env` com os valores de produção:

```
VITE_USE_REAL_API=true
VITE_USE_PROXY=true
VITE_PROXY_URL=https://albion-market-proxy.wendel-gdsilva.workers.dev
```

E garantir que o dashboard do Pages **não sobrescreva** `VITE_USE_REAL_API` com `false`.

---

## Consequências

### Positivas
- Configuração de produção visível no repositório (auditável via git)
- Novos desenvolvedores clonam o repo e têm a config correta imediatamente
- Build local (`npm run build`) reproduz o comportamento de produção

### Negativas
- Testes unitários que mockam fetch com URLs do Albion API direto precisam de `vi.stubEnv("VITE_USE_PROXY", "false")` para isolar o comportamento
- Risco de divergência se o dashboard do Pages tiver valores diferentes dos que estão no `.env` — o dashboard tem precedência e silenciosamente sobrescreve

### Mitigações
- Adicionar `vi.stubEnv("VITE_USE_PROXY", "false")` nos testes que testam comportamento sem proxy (padrão adotado em 4 arquivos)
- Documentar que o dashboard do Pages deve ter `VITE_USE_REAL_API=true` para alinhar com o `.env` commitado

---

## Alternativas consideradas

**A. Usar apenas o dashboard do Pages (sem commitar env vars sensíveis)**
- Rejeitada: as vars não são secretas, e o `.env` serve de documentação e fallback para build local

**B. Usar `.env.production` separado (não commitado)**
- Rejeitada: adicionaria complexidade sem benefício; o `.env` padrão já serve ao propósito

**C. Injetar via CI/CD (GitHub Actions)**
- Rejeitada: Pages gerencia o próprio deploy; duplicar a config em Actions seria redundante
