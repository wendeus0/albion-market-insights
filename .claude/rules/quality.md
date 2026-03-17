# Quality Gate — Albion Market Insights

Comandos: `npm run lint` + `npm run build` + `npm run test`

## Vereditos

- **QUALITY_PASS** — tudo passando, sem ressalvas
- **QUALITY_PASS_WITH_GAPS** — passa com ressalvas documentadas
- **QUALITY_BLOCKED** — lint com erros, build com falha, regressão, `any` sem justificativa, import relativo `../`

Não bloqueia: warnings pré-existentes, bundle levemente maior, TODOs em código não tocado.
