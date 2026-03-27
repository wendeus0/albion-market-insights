import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlertsForm, generateAlertId, getSuggestedThreshold } from './useAlertsForm.tsx';
import type { MarketItem, Alert } from '@/data/types';

const mockRandomUUID = vi.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
  },
  writable: true,
});

const mockItems: MarketItem[] = [
  {
    itemId: 'T4_BAG',
    itemName: 'Beginner Bag',
    tier: 'T4',
    city: 'Lymhurst',
    sellPrice: 1000,
    buyPrice: 900,
    spread: 100,
    spreadPercent: 10,
    timestamp: new Date().toISOString(),
    quality: 'Normal',
    priceHistory: [950, 975, 1000],
  },
  {
    itemId: 'T5_BAG',
    itemName: 'Novice Bag',
    tier: 'T5',
    city: 'Lymhurst',
    sellPrice: 2000,
    buyPrice: 1800,
    spread: 200,
    spreadPercent: 10,
    timestamp: new Date().toISOString(),
    quality: 'Normal',
    priceHistory: [1900, 1950, 2000],
  },
];

describe('useAlertsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRandomUUID.mockReturnValue('test-uuid-123');
  });

  it('should initialize form with default values', () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    expect(result.current.form.getValues()).toEqual({
      itemId: '',
      city: 'all',
      condition: 'below',
      threshold: undefined,
      notifications: { inApp: true, email: false },
    });
  });

  it('should return initial alert type as "below"', () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));
    expect(result.current.alertType).toBe('below');
  });

  it('should create alert with crypto.randomUUID when available', () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    const values = {
      itemId: 'T4_BAG',
      quality: 'Normal',
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
    expect(alert?.quality).toBe('Normal');
    expect(alert?.isActive).toBe(true);
  });

  it('should return null when item is not found', () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    let alert: Alert | null = null;
    act(() => {
      alert = result.current.createAlert({
        itemId: 'NON_EXISTENT',
        quality: 'Normal',
        city: 'all',
        condition: 'below',
        threshold: 500,
        notifications: { inApp: true, email: false },
      });
    });

    expect(alert).toBeNull();
  });

  it('should preserve city value as-is', () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    let alert: Alert | null = null;
    act(() => {
      alert = result.current.createAlert({
        itemId: 'T4_BAG',
        quality: 'Normal',
        city: 'Lymhurst',
        condition: 'above',
        threshold: 1000,
        notifications: { inApp: false, email: true },
      });
    });

    expect(alert?.city).toBe('Lymhurst');
    expect(alert?.condition).toBe('above');
    expect(alert?.notifications).toEqual({ inApp: false, email: true });
  });

  it('should set createdAt to ISO string', () => {
    const before = new Date().toISOString();
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    let alert: Alert | null = null;
    act(() => {
      alert = result.current.createAlert({
        itemId: 'T4_BAG',
        quality: 'Normal',
        city: 'all',
        condition: 'change',
        threshold: 15,
        notifications: { inApp: true, email: false },
      });
    });

    const after = new Date().toISOString();
    expect(alert?.createdAt).toBeDefined();
    expect(alert?.createdAt >= before && alert?.createdAt <= after).toBe(true);
  });

  it('should reset form to default values', async () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    await act(async () => {
      result.current.form.setValue('itemId', 'T5_BAG');
      result.current.form.setValue('quality', 'Normal');
      result.current.form.setValue('city', 'Lymhurst');
      result.current.form.setValue('threshold', 999);
    });

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

  it('should update alertType when condition changes', async () => {
    const { result } = renderHook(() => useAlertsForm({ availableItems: mockItems }));

    await act(async () => {
      result.current.form.setValue('condition', 'above');
    });

    expect(result.current.alertType).toBe('above');
  });
});

describe('getSuggestedThreshold', () => {
  it('should suggest price below average for below alerts', () => {
    expect(getSuggestedThreshold(mockItems, 'T4_BAG', 'Normal', 'all', 'below')).toBe(903);
  });

  it('should suggest price above average for above alerts', () => {
    expect(getSuggestedThreshold(mockItems, 'T5_BAG', 'Normal', 'all', 'above')).toBe(1995);
  });

  it('should suggest default percentage for change alerts', () => {
    expect(getSuggestedThreshold(mockItems, 'T4_BAG', 'Normal', 'all', 'change')).toBe(10);
  });
});

describe('generateAlertId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use crypto.randomUUID when available', () => {
    mockRandomUUID.mockReturnValue('uuid-from-crypto');
    expect(generateAlertId()).toBe('uuid-from-crypto');
  });

  it('should fallback to timestamp + random when crypto.randomUUID is not available', () => {
    mockRandomUUID.mockImplementation(() => {
      throw new Error('Not available');
    });

    const originalRandomUUID = global.crypto.randomUUID;
    // @ts-expect-error intentional
    global.crypto.randomUUID = undefined;

    const id = generateAlertId();

    global.crypto.randomUUID = originalRandomUUID;
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});
