import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Iteração 1: AC-1 — noImplicitAny e strictNullChecks
// Iteração 2 (hooks): AC-1-AC-4 — strictFunctionTypes, strictBindCallApply,
//   strictPropertyInitialization, useUnknownInCatchVariables

function readTsconfig(filename: string) {
  const raw = readFileSync(resolve(process.cwd(), filename), 'utf-8');
  // tsconfig aceita comentários — removê-los antes de parsear como JSON
  const cleaned = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return JSON.parse(cleaned);
}

describe('tsconfig.app.json — strict mode iteração 1 (baseline)', () => {
  const config = readTsconfig('tsconfig.app.json');
  const opts = config.compilerOptions;

  it('deve ter noImplicitAny ativado', () => {
    expect(opts.noImplicitAny).toBe(true);
  });

  it('deve ter strictNullChecks ativado', () => {
    expect(opts.strictNullChecks).toBe(true);
  });
});

describe('tsconfig.json — strict mode iteração 1 (baseline)', () => {
  const config = readTsconfig('tsconfig.json');
  const opts = config.compilerOptions;

  it('deve ter noImplicitAny ativado', () => {
    expect(opts.noImplicitAny).toBe(true);
  });

  it('deve ter strictNullChecks ativado', () => {
    expect(opts.strictNullChecks).toBe(true);
  });
});

describe('tsconfig.app.json — strict mode iteração 2 (hooks)', () => {
  const config = readTsconfig('tsconfig.app.json');
  const opts = config.compilerOptions;

  it('deve ter strictFunctionTypes ativado (AC-1)', () => {
    expect(opts.strictFunctionTypes).toBe(true);
  });

  it('deve ter strictBindCallApply ativado (AC-2)', () => {
    expect(opts.strictBindCallApply).toBe(true);
  });

  it('deve ter strictPropertyInitialization ativado (AC-3)', () => {
    expect(opts.strictPropertyInitialization).toBe(true);
  });

  it('deve ter useUnknownInCatchVariables ativado (AC-4)', () => {
    expect(opts.useUnknownInCatchVariables).toBe(true);
  });
});
