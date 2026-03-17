import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Iteração 1: AC-1 — noImplicitAny e strictNullChecks
// Iteração 2 (hooks): AC-1-AC-4 — strictFunctionTypes, strictBindCallApply,
//   strictPropertyInitialization, useUnknownInCatchVariables
// Iteração 3 (pages): AC-1 — compilação limpa; AC-2 — sem supressões
// Iteração 4 (components): AC-1 — compilação limpa exceto ui/; AC-2 — sem supressões exceto ui/

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

describe('src/pages/ — strict mode iteração 3 (AC-1): compilação limpa', () => {
  it('tsc --noEmit não deve reportar erros em src/pages/', () => {
    let output = '';
    try {
      execSync('npx tsc --noEmit 2>&1', { cwd: resolve(process.cwd()) });
    } catch (err: unknown) {
      output = (err as { stdout?: Buffer; stderr?: Buffer }).stdout?.toString() ?? '';
    }
    const pageErrors = output
      .split('\n')
      .filter((line) => line.includes('src/pages/') && line.includes('error TS'));
    expect(pageErrors).toHaveLength(0);
  });
});

describe('src/pages/ — strict mode iteração 3 (AC-2): sem supressões de tipo', () => {
  const pagesDir = resolve(process.cwd(), 'src/pages');
  const pageFiles = readdirSync(pagesDir).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));

  for (const file of pageFiles) {
    it(`${file} não deve conter @ts-ignore ou @ts-expect-error`, () => {
      const content = readFileSync(resolve(pagesDir, file), 'utf-8');
      expect(content).not.toMatch(/@ts-ignore|@ts-expect-error/);
    });
  }
});

describe('src/components/ — strict mode iteração 4 (AC-1): compilação limpa', () => {
  it('tsc --noEmit não deve reportar erros em src/components/ (exceto ui/)', () => {
    let output = '';
    try {
      execSync('npx tsc --noEmit 2>&1', { cwd: resolve(process.cwd()) });
    } catch (err: unknown) {
      output = (err as { stdout?: Buffer; stderr?: Buffer }).stdout?.toString() ?? '';
    }
    const componentErrors = output
      .split('\n')
      .filter((line) => line.includes('src/components/') && !line.includes('src/components/ui/') && line.includes('error TS'));
    expect(componentErrors).toHaveLength(0);
  });
});

function getComponentFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'ui') {
        getComponentFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('src/components/ — strict mode iteração 4 (AC-2): sem supressões de tipo', () => {
  const componentsDir = resolve(process.cwd(), 'src/components');
  const componentFiles = getComponentFiles(componentsDir);

  for (const filePath of componentFiles) {
    const relativePath = filePath.replace(process.cwd() + '/', '');
    it(`${relativePath} não deve conter @ts-ignore ou @ts-expect-error`, () => {
      const content = readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/@ts-ignore|@ts-expect-error/);
    });
  }
});
