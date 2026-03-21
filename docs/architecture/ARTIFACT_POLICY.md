# ARTIFACT_POLICY.md — Política de artefatos de build

## Princípio

Artefatos gerados (`dist/`, relatórios de execução e derivados temporários) não devem ser versionados no repositório.

## Regras

- `dist/` deve permanecer ignorado no Git.
- Artefatos de cobertura/teste (`coverage/`, `playwright-report/`, `test-results/`) devem permanecer ignorados.
- Build oficial para validação deve ser reproduzível via pipeline (`npm run build` / `npm run quality:gate`).

## Motivação

- Evitar ruído em PRs
- Evitar divergência entre artefato local e artefato gerado em CI
- Reduzir acoplamento com ambiente de máquina local

## Exceções

- Nenhuma exceção permanente prevista.
- Caso seja necessário anexar artefato para análise, usar mecanismo de artifacts do CI, não commit no repositório.

## Checklist operacional

- `.gitignore` contém `dist` e `coverage/`
- PRs de documentação/feature não incluem artefatos gerados
- Rebuild local + CI é a fonte de verdade

