# SPEC — Lote 1B Item 4: Runtime Node 20

**Status:** Aprovada  
**Data:** 2026-03-19  
**Branch:** `feat/lote-1b-item4-runtime-node20`  
**Autor:** Claude Code

---

## Contexto e Motivação

O projeto tem uma inconsistência documental entre o README e a realidade do CI/CD. O README afirma suporte a Node 18+, mas o GitHub Actions workflow já utiliza Node 20. Isso pode causar confusão para novos contribuidores e instalação de dependências incompatíveis.

## Problema a Resolver

1. README.md menciona "Node 18+" mas CI usa Node 20
2. Falta explicitar a versão mínima suportada no package.json `engines`
3. Workflow de CI não especifica explicitamente a versão do npm

## Fora do Escopo

- Não atualizar para Node 24 (agendado para 2026-06-02)
- Não modificar código fonte da aplicação
- Não alterar comportamento runtime

## Critérios de Aceitação

### Cenário 1: README atualizado com versão correta

**Given** um desenvolvedor lê o README  
**When** verifica os requisitos de Node.js  
**Then** encontra "Node 20+" em vez de "Node 18+"

### Cenário 2: package.json especifica engines

**Given** o package.json do projeto  
**When** verifica o campo `engines`  
**Then** encontra `"node": ">=20.0.0"`

### Cenário 3: Workflow CI alinhado

**Given** o workflow `.github/workflows/quality-gate.yml`  
**When** verifica a configuração de Node  
**Then** encontra `node-version: '20'` explicitamente

### Cenário 4: Quality Gate passa com Node 20

**Given** o workflow CI executa  
**When** roda `npm ci`, testes e build  
**Then** todos os passos completam com sucesso

## Dependências

Nenhuma — esta é uma atualização documental e de configuração.

## Riscos e Incertezas

- Baixo risco — apenas documentação e metadados
- Se algum desenvolvedor local usa Node 18, precisará atualizar

## Referências

- PR #45 — qualidade de CI
- PENDING_LOG.md — Item 4 do Lote 1B
