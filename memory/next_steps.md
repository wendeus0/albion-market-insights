---
name: next_steps
description: Próximos passos recomendados para o projeto — sobrescrito a cada sessão
type: project
---

## Next recommended steps

1. **Aprovar e mergear PR #79**: https://github.com/wendeus0/albion-market-insights/pull/79 — branch `feat/api-proxy-worker`, 5 commits, 23 testes GREEN
2. **Configurar `CLOUDFLARE_API_TOKEN` em GitHub Secrets**: necessário para que o workflow `deploy-worker.yml` faça deploy automático após merge do PR
3. **Deploy do Worker e ativar proxy no frontend**: após deploy em `workers.dev`, configurar `VITE_USE_PROXY=true` e `VITE_PROXY_URL` no `.env` de produção/staging
4. **Manter observação Node 24**: continuar janela de estabilidade antes de promover para default
5. **Reavaliar issue #59 (flakiness)**: decidir se investigação adicional entra no próximo ciclo
