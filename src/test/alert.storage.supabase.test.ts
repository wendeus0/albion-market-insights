import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAlertStorageService } from '@/services/alert.storage.supabase';
import type { Alert } from '@/data/types';

const makeAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'test-id',
  itemId: 'T4_BAG',
  itemName: 'Bag',
  quality: 'Normal',
  city: 'Caerleon',
  condition: 'below',
  threshold: 1000,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  notifications: { inApp: true, email: false },
  ...overrides,
});

const makeRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-id',
  user_id: 'user-123',
  item_id: 'T4_BAG',
  item_name: 'Bag',
  quality: 'Normal',
  city: 'Caerleon',
  condition: 'below',
  threshold: 1000,
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
  notifications: { inApp: true, email: false },
  ...overrides,
});

function makeMockClient(data: unknown[] | null = [], error: unknown = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error }),
    upsert: vi.fn().mockResolvedValue({ data: null, error }),
    delete: vi.fn().mockReturnThis(),
  };
  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  };
}

describe('SupabaseAlertStorageService', () => {
  describe('getAlerts()', () => {
    it('deve retornar [] quando não há alertas', async () => {
      const mock = makeMockClient([]);
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      const result = await service.getAlerts();
      expect(result).toEqual([]);
    });

    it('deve mapear snake_case → camelCase corretamente', async () => {
      const rows = [makeRow()];
      const mock = makeMockClient(rows);
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      const result = await service.getAlerts();
      expect(result[0]).toEqual(makeAlert());
    });

    it('deve lançar Error quando Supabase retorna erro', async () => {
      const mock = makeMockClient(null, { message: 'network error' });
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      await expect(service.getAlerts()).rejects.toThrow('network error');
    });

    it('deve filtrar linhas inválidas silenciosamente', async () => {
      const rows = [makeRow(), { id: null }];
      const mock = makeMockClient(rows);
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      const result = await service.getAlerts();
      expect(result).toHaveLength(1);
    });

    it('deve assumir Normal ao ler linha legada sem quality', async () => {
      const rows = [makeRow({ quality: undefined })];
      const mock = makeMockClient(rows);
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      const result = await service.getAlerts();
      expect(result[0].quality).toBe('Normal');
    });
  });

  describe('saveAlert()', () => {
    it('deve fazer upsert mapeando camelCase → snake_case', async () => {
      const mock = makeMockClient();
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      await service.saveAlert(makeAlert());
      expect(mock._chain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          user_id: 'user-123',
          item_id: 'T4_BAG',
          item_name: 'Bag',
          quality: 'Normal',
          is_active: true,
          created_at: '2026-01-01T00:00:00.000Z',
        }),
      );
    });

    it('deve lançar Error quando upsert falha', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: { message: 'upsert failed' } }),
        delete: vi.fn().mockReturnThis(),
      };
      const mock = { from: vi.fn().mockReturnValue(chain) };
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      await expect(service.saveAlert(makeAlert())).rejects.toThrow('upsert failed');
    });
  });

  describe('deleteAlert()', () => {
    it('deve chamar delete com id e user_id corretos', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vi.fn().mockReturnThis(),
      };
      const eqUserIdFn = vi.fn().mockResolvedValue({ error: null });
      const eqIdFn = vi.fn().mockReturnValue({ eq: eqUserIdFn });
      chain.delete = vi.fn().mockReturnValue({ eq: eqIdFn });
      const mock = { from: vi.fn().mockReturnValue(chain) };
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      await service.deleteAlert('test-id');
      expect(chain.delete).toHaveBeenCalled();
      expect(eqIdFn).toHaveBeenCalledWith('id', 'test-id');
      expect(eqUserIdFn).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('deve lançar Error quando delete falha', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
          }),
        }),
      };
      const mock = { from: vi.fn().mockReturnValue(chain) };
      const service = new SupabaseAlertStorageService(mock as never, 'user-123');
      await expect(service.deleteAlert('test-id')).rejects.toThrow('delete failed');
    });
  });
});
