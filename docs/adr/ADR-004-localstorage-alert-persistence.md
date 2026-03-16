# ADR-004 — localStorage para persistência de alertas

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

Alertas de mercado configurados pelo usuário precisam sobreviver a recarregamentos de
página. O projeto não possui backend — é uma aplicação front-end pura que consome a API
pública do Albion Online. O volume de dados por usuário é pequeno (dezenas de alertas
no máximo), e o escopo atual não requer sincronização entre dispositivos.

## Decisão

Persistir alertas em `localStorage` via `AlertStorageService` (`src/services/alert.storage.ts`).
A chave usada é `albion_alerts`. O serviço encapsula leitura, escrita e deleção com
parsing/serialização JSON. O `MockMarketService` delega operações de alerta ao
`AlertStorageService`, mantendo comportamento consistente entre mock e API.

## Consequências

- Alertas são per-device/per-browser — não há sincronização entre sessões ou dispositivos.
- Limite prático de ~5MB por origem no localStorage é mais do que suficiente para o
  volume esperado de alertas.
- Limpeza de dados do browser apaga alertas sem aviso — risco aceitável para o escopo atual.
- `AlertStorageService` é testável via `localStorage` simulado em Vitest (jsdom).
- Migração futura para backend exigiria substituir apenas `AlertStorageService`, sem
  impacto nos componentes.

## Alternativas consideradas

- **sessionStorage:** dados perdidos ao fechar a aba — inaceitável para alertas configurados.
- **IndexedDB:** capacidade maior e API assíncrona, mas complexidade desnecessária para
  o volume atual de dados simples (array de objetos).
- **Backend próprio:** fora do escopo — o projeto é deliberadamente front-end only para
  minimizar infraestrutura.
