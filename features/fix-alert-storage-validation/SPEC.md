# SPEC — Hardening de Alert Storage

**Status:** Draft
**Data:** 2026-03-17
**Autor:** Claude
**Debt ref:** SECURITY_AUDIT_REPORT.md — observação LOW em `src/services/alert.storage.ts`

---

## Contexto e Motivação

A auditoria de segurança do sprint identificou que `src/services/alert.storage.ts` lê dados do `localStorage` sem validação de schema. O código atual usa `JSON.parse(raw) as Alert[]`, que é apenas uma asserção de tipo TypeScript e não valida a estrutura real dos dados.

Isso representa um risco de UX: se o `localStorage` contiver dados malformados (por corrupção manual, versões incompatíveis da aplicação, ou extensões do navegador), a aplicação pode carregar objetos inválidos que causam comportamentos inesperados ou falhas em cascata.

## Problema a Resolver

O sistema atual:
1. Não valida se os dados lidos do `localStorage` seguem o schema `Alert`
2. Pode propagar objetos malformados para toda a aplicação
3. Não tem defesa contra corrupção de dados persistidos

## Fora do Escopo

- Criptografia dos dados no `localStorage`
- Migração de schema entre versões da aplicação
- Alteração da interface pública do `AlertStorageService`
- Modificação de outros services ou componentes

## Critérios de Aceitação

### AC-1: Schema de validação

**Given** que o tipo `Alert` está definido
**When** criamos um schema Zod para validação
**Then** ele deve cobrir todos os campos obrigatórios do `Alert`

### AC-2: Validação na leitura

**Given** que o `localStorage` contém dados malformados (JSON inválido, campos ausentes, tipos incorretos)
**When** `AlertStorageService.getAlerts()` é chamado
**Then** deve retornar array vazio `[]` e não propagar dados inválidos

### AC-3: Validação de dados válidos

**Given** que o `localStorage` contém dados válidos no formato `Alert[]`
**When** `AlertStorageService.getAlerts()` é chamado
**Then** deve retornar os alertas normalmente

### AC-4: Testes de regressão

**Given** que implementamos validação
**When** executamos os testes
**Then** todos os testes existentes devem continuar passando

## Dependências

- `zod` já está no projeto
- Tipo `Alert` em `src/data/types.ts`
- `SECURITY_AUDIT_REPORT.md` como referência

## Riscos e Incertezas

- Mudança de comportamento se houver versões antigas persistidas
- Overhead de parsing adicional (aceitável para volume pequeno)

## Referências

- `src/services/alert.storage.ts`
- `src/data/types.ts`
- `src/lib/schemas.ts` (exemplo de schema Zod)
- `SECURITY_AUDIT_REPORT.md`
