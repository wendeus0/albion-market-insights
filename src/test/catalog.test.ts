import { describe, it, expect } from 'vitest';
import { ITEM_IDS, ITEM_CATALOG } from '@/data/constants';

describe('ITEM_CATALOG integrity', () => {
  it('ITEM_IDS tem ≥400 IDs únicos (AC1)', () => {
    expect(new Set(ITEM_IDS).size).toBeGreaterThanOrEqual(400);
  });

  it('ITEM_IDS não tem duplicatas (AC2)', () => {
    expect(ITEM_IDS.length).toBe(new Set(ITEM_IDS).size);
  });

  it('ITEM_CATALOG tem ≥10 categorias', () => {
    expect(Object.keys(ITEM_CATALOG).length).toBeGreaterThanOrEqual(10);
  });

  it('ITEM_IDS é derivado de ITEM_CATALOG', () => {
    const fromCatalog = Object.values(ITEM_CATALOG).flatMap(c => c.ids);
    expect(ITEM_IDS).toEqual(fromCatalog);
  });

  it('todas as categorias têm label não-vazio', () => {
    for (const [key, cat] of Object.entries(ITEM_CATALOG)) {
      expect(cat.label, `categoria ${key}`).toBeTruthy();
      expect(cat.ids.length, `categoria ${key}`).toBeGreaterThan(0);
    }
  });
});
