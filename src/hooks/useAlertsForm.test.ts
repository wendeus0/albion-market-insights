import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlertsForm, generateAlertId } from './useAlertsForm.tsx';
import type { MarketItem, Alert } from '@/data/types';

// Mock crypto.randomUUID
const mockRandomUUID = vi.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
  },
  writable: true,
});

describe('useAlertsForm', () => {
  const mockOnSaveAlert = vi.fn();
  
  const mockItems: MarketItem[] = [
    {
      itemId: 'T4_BAG',
      itemName: 'Beginner Bag',
      tier: 'T4',
      city: 'Lymhurst',
      sellPrice: 1000,
      buyPrice: 900,
      spreadPercent: 10,
      timestamp: new Date().toISOString(),
    },
    {
      itemId: 'T5_BAG',
      itemName: 'Novice Bag',
      tier: 'T5',
      city: 'Lymhurst',
      sellPrice: 2000,
      buyPrice: 1800,
      spreadPercent: 10,
      timestamp: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRandomUUID.mockReturnValue('test-uuid-123');
  });

  describe('form initialization', () => {
    it('should initialize form with default values', () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      expect(result.current.form.getValues()).toEqual({
        itemId: '',
        city: 'all',
        condition: 'below',
        threshold: undefined,
        notifications: { inApp: true, email: false },
      });
    });

    it('should return initial alert type as "below"', () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      expect(result.current.alertType).toBe('below');
    });
  });

  describe('createAlert', () => {
    it('should create alert with crypto.randomUUID when available', () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      const values = {
        itemId: 'T4_BAG',
        city: 'all' as const,
        condition: 'below' as const,
        threshold: 500,
        notifications: { inApp: true, email: false },
      };

      let alert: Alert | null = null;
      act(() => {
        alert = result.current.createAlert(values);
      });

      expect(mockRandomUUID).toHaveBeenCalled();
      expect(alert?.id).toBe('test-uuid-123');
      expect(alert?.itemName).toBe('Beginner Bag');
      expect(alert?.isActive).toBe(true);
      expect(mockOnSaveAlert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'test-uuid-123',
        itemId: 'T4_BAG',
        itemName: 'Beginner Bag',
      }));
    });

    it('should return null when item is not found', () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      const values = {
        itemId: 'NON_EXISTENT',
        city: 'all' as const,
        condition: 'below' as const,
        threshold: 500,
        notifications: { inApp: true, email: false },
      };

      let alert: Alert | null = null;
      act(() => {
        alert = result.current.createAlert(values);
      });

      expect(alert).toBeNull();
      expect(mockOnSaveAlert).not.toHaveBeenCalled();
    });

    it('should preserve city value as-is (canonical "all" or city name)', () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      const values = {
        itemId: 'T4_BAG',
        city: 'Lymhurst' as const,
        condition: 'above' as const,
        threshold: 1000,
        notifications: { inApp: false, email: true },
      };

      let alert: Alert | null = null;
      act(() => {
        alert = result.current.createAlert(values);
      });

      expect(alert?.city).toBe('Lymhurst');
      expect(alert?.condition).toBe('above');
      expect(alert?.notifications).toEqual({ inApp: false, email: true });
    });

    it('should set createdAt to ISO string', () => {
      const before = new Date().toISOString();
      
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      const values = {
        itemId: 'T4_BAG',
        city: 'all' as const,
        condition: 'change' as const,
        threshold: 15,
        notifications: { inApp: true, email: false },
      };

      let alert: Alert | null = null;
      act(() => {
        alert = result.current.createAlert(values);
      });

      const after = new Date().toISOString();
      expect(alert?.createdAt).toBeDefined();
      expect(alert?.createdAt >= before && alert?.createdAt <= after).toBe(true);
    });
  });

  describe('resetForm', () => {
    it('should reset form to default values', async () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      // Change form values
      await act(async () => {
        await result.current.form.setValue('itemId', 'T5_BAG');
        await result.current.form.setValue('city', 'Lymhurst');
        await result.current.form.setValue('threshold', 999);
      });

      expect(result.current.form.getValues('itemId')).toBe('T5_BAG');

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.form.getValues()).toEqual({
        itemId: '',
        city: 'all',
        condition: 'below',
        threshold: undefined,
        notifications: { inApp: true, email: false },
      });
    });
  });

  describe('alertType watch', () => {
    it('should update alertType when condition changes', async () => {
      const { result } = renderHook(() =>
        useAlertsForm({ onSaveAlert: mockOnSaveAlert, availableItems: mockItems })
      );

      expect(result.current.alertType).toBe('below');

      await act(async () => {
        await result.current.form.setValue('condition', 'above');
      });

      expect(result.current.alertType).toBe('above');
    });
  });
});

describe('generateAlertId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use crypto.randomUUID when available', () => {
    mockRandomUUID.mockReturnValue('uuid-from-crypto');
    
    const id = generateAlertId();
    
    expect(mockRandomUUID).toHaveBeenCalled();
    expect(id).toBe('uuid-from-crypto');
  });

  it('should fallback to timestamp + random when crypto.randomUUID is not available', () => {
    mockRandomUUID.mockImplementation(() => {
      throw new Error('Not available');
    });

    // Temporarily remove randomUUID
    const originalRandomUUID = global.crypto.randomUUID;
    // @ts-expect-error - intentionally removing for test
    global.crypto.randomUUID = undefined;

    const id = generateAlertId();
    
    // Restore
    global.crypto.randomUUID = originalRandomUUID;

    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

