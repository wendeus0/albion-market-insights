import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// AC-1: ambos os tsconfigs devem ter noImplicitAny e strictNullChecks ativados
// AC-2 e AC-3 são validados pela ausência de erros em npm run build

function readTsconfig(filename: string) {
  const raw = readFileSync(resolve(process.cwd(), filename), 'utf-8');
  // tsconfig aceita comentários — removê-los antes de parsear como JSON
  const cleaned = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return JSON.parse(cleaned);
}

describe('tsconfig.app.json — strict mode flags (AC-1)', () => {
  const config = readTsconfig('tsconfig.app.json');
  const opts = config.compilerOptions;

  it('deve ter noImplicitAny ativado', () => {
    expect(opts.noImplicitAny).toBe(true);
  });

  it('deve ter strictNullChecks ativado', () => {
    expect(opts.strictNullChecks).toBe(true);
  });
});

describe('tsconfig.json — strict mode flags (AC-1)', () => {
  const config = readTsconfig('tsconfig.json');
  const opts = config.compilerOptions;

  it('deve ter noImplicitAny ativado', () => {
    expect(opts.noImplicitAny).toBe(true);
  });

  it('deve ter strictNullChecks ativado', () => {
    expect(opts.strictNullChecks).toBe(true);
  });
});
