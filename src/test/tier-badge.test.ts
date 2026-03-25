import { describe, it, expect } from "vitest";
import { formatTierBadge } from "@/data/constants";

describe("formatTierBadge", () => {
  it("deve retornar apenas tier para item sem encantamento (AC-2)", () => {
    expect(formatTierBadge("T4_MAIN_SWORD", "T4")).toBe("T4");
    expect(formatTierBadge("T5_BAG", "T5")).toBe("T5");
    expect(formatTierBadge("T8_2H_HOLYSTAFF", "T8")).toBe("T8");
  });

  it("deve retornar tier com encantamento para item @1 (AC-2)", () => {
    expect(formatTierBadge("T4_MAIN_SWORD@1", "T4")).toBe("T4.1");
    expect(formatTierBadge("T5_BAG@1", "T5")).toBe("T5.1");
  });

  it("deve retornar tier com encantamento para item @2 (AC-2)", () => {
    expect(formatTierBadge("T4_MAIN_SWORD@2", "T4")).toBe("T4.2");
    expect(formatTierBadge("T6_OFF_SHIELD@2", "T6")).toBe("T6.2");
  });

  it("deve retornar tier com encantamento para item @3 (AC-2)", () => {
    expect(formatTierBadge("T4_MAIN_SWORD@3", "T4")).toBe("T4.3");
    expect(formatTierBadge("T8_2H_HOLYSTAFF@3", "T8")).toBe("T8.3");
  });

  it("deve extrair nivel de encantamento do itemId (AC-3)", () => {
    const itemId = "T4_MAIN_SWORD@2";
    const enchantMatch = itemId.match(/@([0-3])$/);
    expect(enchantMatch).not.toBeNull();
    expect(enchantMatch?.[1]).toBe("2");
  });

  it("deve usar ponto como separador entre tier e encantamento (AC-3)", () => {
    const result = formatTierBadge("T4_MAIN_SWORD@1", "T4");
    expect(result).toMatch(/^T\d\.\d$/);
    expect(result).toBe("T4.1");
  });

  it("deve manter consistencia para todos os niveis de tier (AC-4)", () => {
    const tiers = ["T4", "T5", "T6", "T7", "T8"];
    const enchantLevels = [0, 1, 2, 3];

    for (const tier of tiers) {
      for (const enchant of enchantLevels) {
        const itemId = enchant > 0 ? `${tier}_ITEM@${enchant}` : `${tier}_ITEM`;
        const result = formatTierBadge(itemId, tier);
        const expected = enchant > 0 ? `${tier}.${enchant}` : tier;
        expect(result).toBe(expected);
      }
    }
  });
});
