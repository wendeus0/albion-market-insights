import { describe, it, expect } from "vitest";
import {
  ITEM_IDS,
  ITEM_CATALOG,
  ENCHANTMENT_LEVELS,
  ITEM_NAMES,
} from "@/data/constants";

describe("ITEM_CATALOG integrity", () => {
  it("ITEM_IDS tem ≥400 IDs únicos (AC1)", () => {
    expect(new Set(ITEM_IDS).size).toBeGreaterThanOrEqual(400);
  });

  it("ITEM_IDS não tem duplicatas (AC2)", () => {
    expect(ITEM_IDS.length).toBe(new Set(ITEM_IDS).size);
  });

  it("ITEM_CATALOG tem ≥10 categorias", () => {
    expect(Object.keys(ITEM_CATALOG).length).toBeGreaterThanOrEqual(10);
  });

  it("ITEM_IDS é derivado de ITEM_CATALOG", () => {
    const fromCatalog = Object.values(ITEM_CATALOG).flatMap((c) => c.ids);
    expect(ITEM_IDS).toEqual(fromCatalog);
  });

  it("todas as categorias têm label não-vazio", () => {
    for (const [key, cat] of Object.entries(ITEM_CATALOG)) {
      expect(cat.label, `categoria ${key}`).toBeTruthy();
      expect(cat.ids.length, `categoria ${key}`).toBeGreaterThan(0);
    }
  });
});

describe("ITEM_CATALOG enchanted items", () => {
  it("deve ter constante ENCHANTMENT_LEVELS definida", () => {
    expect(ENCHANTMENT_LEVELS).toBeDefined();
    expect(ENCHANTMENT_LEVELS).toEqual([0, 1, 2, 3]);
  });

  it("deve gerar IDs com encantamentos (@1, @2, @3)", () => {
    const enchantedIds = ITEM_IDS.filter((id) => id.includes("@"));
    expect(enchantedIds.length).toBeGreaterThan(0);

    expect(ITEM_IDS.some((id) => id.endsWith("@1"))).toBe(true);
    expect(ITEM_IDS.some((id) => id.endsWith("@2"))).toBe(true);
    expect(ITEM_IDS.some((id) => id.endsWith("@3"))).toBe(true);
  });

  it("cada item base deve ter variantes encantadas na mesma categoria", () => {
    const swordsCategory = ITEM_CATALOG["swords"];
    expect(swordsCategory).toBeDefined();

    const baseId = "T4_MAIN_SWORD";
    expect(swordsCategory.ids).toContain(baseId);
    expect(swordsCategory.ids).toContain("T4_MAIN_SWORD@1");
    expect(swordsCategory.ids).toContain("T4_MAIN_SWORD@2");
    expect(swordsCategory.ids).toContain("T4_MAIN_SWORD@3");
  });

  it("deve ter ~4x mais IDs com encantamentos (AC-1, AC-2)", () => {
    expect(ITEM_IDS.length).toBeGreaterThanOrEqual(1500);
  });

  it("IDs encantados devem seguir formato correto", () => {
    const enchantedIds = ITEM_IDS.filter((id) => id.includes("@"));

    for (const id of enchantedIds) {
      expect(id).toMatch(/^T[4-8]_.+@[1-3]$/);
    }
  });
});

describe("ITEM_NAMES tier naming", () => {
  it("usa prefixo de tier por extenso para item base (Frente A)", () => {
    expect(ITEM_NAMES["T4_MAIN_SWORD"]).toBe("Adept's Broadsword");
    expect(ITEM_NAMES["T5_MAIN_SWORD"]).toBe("Expert's Broadsword");
    expect(ITEM_NAMES["T6_MAIN_SWORD"]).toBe("Master's Broadsword");
    expect(ITEM_NAMES["T7_MAIN_SWORD"]).toBe("Grandmaster's Broadsword");
    expect(ITEM_NAMES["T8_MAIN_SWORD"]).toBe("Elder's Broadsword");
  });

  it("nao inclui sufixo de encantamento no nome (AC-1)", () => {
    expect(ITEM_NAMES["T4_MAIN_SWORD@1"]).toBe("Adept's Broadsword");
    expect(ITEM_NAMES["T4_MAIN_SWORD@2"]).toBe("Adept's Broadsword");
    expect(ITEM_NAMES["T4_MAIN_SWORD@3"]).toBe("Adept's Broadsword");
    expect(ITEM_NAMES["T8_MAIN_SWORD@1"]).toBe("Elder's Broadsword");
    expect(ITEM_NAMES["T8_MAIN_SWORD@2"]).toBe("Elder's Broadsword");
    expect(ITEM_NAMES["T8_MAIN_SWORD@3"]).toBe("Elder's Broadsword");
  });

  it("nome de item encantado eh igual ao nome base sem encantamento (AC-1)", () => {
    const baseName = ITEM_NAMES["T4_MAIN_SWORD"];
    const enchantedName = ITEM_NAMES["T4_MAIN_SWORD@1"];
    expect(enchantedName).toBe(baseName);
    expect(enchantedName).not.toContain(".1");
    expect(enchantedName).not.toContain(".2");
    expect(enchantedName).not.toContain(".3");
  });
});
