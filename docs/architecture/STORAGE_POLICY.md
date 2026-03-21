# STORAGE_POLICY.md — Política de dados em localStorage

## Escopo

Este documento define quais dados podem ser persistidos localmente no navegador e por quanto tempo, no contexto atual frontend-only do projeto.

## Dados persistidos

1. Alertas de usuário
- Chave: `albion_alerts`
- Finalidade: manter configurações de alerta entre sessões
- Base técnica: ADR-004

2. Cache de mercado
- Chave: `albion_market_cache`
- Finalidade: reduzir latência e carga na API pública
- Base técnica: ADR-007

## Retenção

- Alertas: persistem até remoção explícita pelo usuário ou limpeza de dados do navegador.
- Cache de mercado: controlado por TTL da aplicação; dados expirados devem ser descartados pela validação de cache.

## Limites e comportamento esperado

- O armazenamento é por navegador/dispositivo (não sincronizado entre dispositivos).
- Limpeza de dados do navegador remove alertas e cache.
- Em `QuotaExceededError`, a aplicação deve degradar de forma segura (sem quebrar UX principal).

## Privacidade

- Não armazenar segredos, tokens ou credenciais em localStorage.
- Armazenar somente dados funcionais necessários ao UX local.
- Em evolução para backend, revisar esta política e mover dados sensíveis para armazenamento servidor.

## Operação e revisão

- Revisar esta política quando houver mudança de escopo (ex.: backend, autenticação, sincronização multi-device).
- Revisar junto com ADR-004/ADR-007 sempre que alterar formato, chave ou TTL.

