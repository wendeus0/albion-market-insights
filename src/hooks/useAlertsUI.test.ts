import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAlertsUI } from './useAlertsUI.tsx';
import type { Alert } from '@/data/types';

describe('useAlertsUI', () => {
  const { result } = renderHook(() => useAlertsUI());

  describe('getConditionIcon', () => {
    it('should return ArrowDown icon for "below" condition', () => {
      const icon = result.current.getConditionIcon('below');
      expect(icon).toBeDefined();
    });

    it('should return ArrowUp icon for "above" condition', () => {
      const icon = result.current.getConditionIcon('above');
      expect(icon).toBeDefined();
    });

    it('should return Percent icon for "change" condition', () => {
      const icon = result.current.getConditionIcon('change');
      expect(icon).toBeDefined();
    });
  });

  describe('getConditionStyles', () => {
    it('should return success styles for "below" condition', () => {
      const styles = result.current.getConditionStyles('below');
      expect(styles.className).toContain('text-success');
    });

    it('should return destructive styles for "above" condition', () => {
      const styles = result.current.getConditionStyles('above');
      expect(styles.className).toContain('text-destructive');
    });

    it('should return primary styles for "change" condition', () => {
      const styles = result.current.getConditionStyles('change');
      expect(styles.className).toContain('text-primary');
    });
  });

  describe('getConditionText', () => {
    it('should format "below" condition with locale string', () => {
      const alert: Alert = {
        id: '1',
        itemId: 'T4_BAG',
        itemName: 'Bag',
        city: 'all',
        condition: 'below',
        threshold: 50000,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      };

      const text = result.current.getConditionText(alert);
      expect(text).toBe('Price below 50,000');
    });

    it('should format "above" condition with locale string', () => {
      const alert: Alert = {
        id: '1',
        itemId: 'T4_BAG',
        itemName: 'Bag',
        city: 'all',
        condition: 'above',
        threshold: 100000,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      };

      const text = result.current.getConditionText(alert);
      expect(text).toBe('Price above 100,000');
    });

    it('should format "change" condition with %', () => {
      const alert: Alert = {
        id: '1',
        itemId: 'T4_BAG',
        itemName: 'Bag',
        city: 'all',
        condition: 'change',
        threshold: 15,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      };

      const text = result.current.getConditionText(alert);
      expect(text).toBe('Price change ≥ 15%');
    });
  });

  describe('getCityLabel', () => {
    it('should return "All Cities" for "all"', () => {
      const label = result.current.getCityLabel('all');
      expect(label).toBe('All Cities');
    });

    it('should return city name for specific cities', () => {
      const label = result.current.getCityLabel('Lymhurst');
      expect(label).toBe('Lymhurst');
    });

    it('should return city name for any other value', () => {
      const label = result.current.getCityLabel('Martlock');
      expect(label).toBe('Martlock');
    });
  });
});

