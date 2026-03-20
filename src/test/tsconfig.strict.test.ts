import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

// Iteração 5 (consolidação): strict: true master flag
// - Iterações 1-4 migraram gradualmente 6 flags individuais
// - Agora consolidado em strict: true para simplificar e eliminar divergências

function readTsconfig(filename: string) {
  const raw = readFileSync(resolve(process.cwd(), filename), "utf-8");
  // tsconfig aceita comentários — removê-los antes de parsear como JSON
  const cleaned = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(cleaned);
}

describe("tsconfig.app.json — strict mode iteração 5 (consolidação)", () => {
  const config = readTsconfig("tsconfig.app.json");
  const opts = config.compilerOptions;

  it("deve ter strict: true ativado", () => {
    expect(opts.strict).toBe(true);
  });
});

describe("tsconfig.json — strict mode iteração 5 (consolidação)", () => {
  const config = readTsconfig("tsconfig.json");
  const opts = config.compilerOptions;

  it("deve ter strict: true ativado", () => {
    expect(opts.strict).toBe(true);
  });
});

function runTscNoEmit(): string {
  try {
    execSync("node ./node_modules/typescript/bin/tsc --noEmit", {
      cwd: resolve(process.cwd()),
      stdio: "pipe",
      timeout: 60_000,
    });
    return "";
  } catch (err: unknown) {
    const stdout =
      (err as { stdout?: Buffer; stderr?: Buffer }).stdout?.toString() ?? "";
    const stderr =
      (err as { stdout?: Buffer; stderr?: Buffer }).stderr?.toString() ?? "";
    return `${stdout}\n${stderr}`;
  }
}

describe("src/pages/ — strict mode iteração 3 (AC-1): compilação limpa", () => {
  it(
    "tsc --noEmit não deve reportar erros em src/pages/",
    () => {
      const output = runTscNoEmit();
      const pageErrors = output
        .split("\n")
        .filter(
          (line) => line.includes("src/pages/") && line.includes("error TS"),
        );
      expect(pageErrors).toHaveLength(0);
    },
    60_000,
  );
});

describe("src/pages/ — strict mode iteração 3 (AC-2): sem supressões de tipo", () => {
  const pagesDir = resolve(process.cwd(), "src/pages");
  const pageFiles = readdirSync(pagesDir).filter(
    (f) => f.endsWith(".tsx") || f.endsWith(".ts"),
  );

  for (const file of pageFiles) {
    it(`${file} não deve conter @ts-ignore ou @ts-expect-error`, () => {
      const content = readFileSync(resolve(pagesDir, file), "utf-8");
      expect(content).not.toMatch(/@ts-ignore|@ts-expect-error/);
    });
  }
});

describe("src/components/ — strict mode iteração 4 (AC-1): compilação limpa", () => {
  it(
    "tsc --noEmit não deve reportar erros em src/components/ (exceto ui/)",
    () => {
      const output = runTscNoEmit();
      const componentErrors = output
        .split("\n")
        .filter(
          (line) =>
            line.includes("src/components/") &&
            !line.includes("src/components/ui/") &&
            line.includes("error TS"),
        );
      expect(componentErrors).toHaveLength(0);
    },
    60_000,
  );
});

function getComponentFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "ui") {
        getComponentFiles(fullPath, files);
      }
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("src/components/ — strict mode iteração 4 (AC-2): sem supressões de tipo", () => {
  const componentsDir = resolve(process.cwd(), "src/components");
  const componentFiles = getComponentFiles(componentsDir);

  for (const filePath of componentFiles) {
    const relativePath = filePath.replace(process.cwd() + "/", "");
    it(`${relativePath} não deve conter @ts-ignore ou @ts-expect-error`, () => {
      const content = readFileSync(filePath, "utf-8");
      expect(content).not.toMatch(/@ts-ignore|@ts-expect-error/);
    });
  }
});
