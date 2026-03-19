import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { useAlertsFeedback } from './useAlertsFeedback.tsx';
import type { Alert } from '@/data/types';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('useAlertsFeedback', () => {
  const mockOnDeleteAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notifyToggle', () => {
    it('should show success toast when disabling alert', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      const alert: Alert = {
        id: '1',
        itemId: 'T4_BAG',
        itemName: 'Beginner Bag',
        city: 'all',
        condition: 'below',
        threshold: 500,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      };

      act(() => {
        result.current.notifyToggle(alert);
      });

      expect(toast.success).toHaveBeenCalledWith('Alert disabled', {
        description: 'Your alert for Beginner Bag has been disabled.',
      });
    });

    it('should show success toast when enabling alert', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      const alert: Alert = {
        id: '1',
        itemId: 'T4_BAG',
        itemName: 'Beginner Bag',
        city: 'all',
        condition: 'below',
        threshold: 500,
        isActive: false,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      };

      act(() => {
        result.current.notifyToggle(alert);
      });

      expect(toast.success).toHaveBeenCalledWith('Alert enabled', {
        description: 'Your alert for Beginner Bag has been enabled.',
      });
    });
  });

  describe('notifyDelete', () => {
    it('should call onDeleteAlert and show toast with item name', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      act(() => {
        result.current.notifyDelete('alert-123', 'Beginner Bag');
      });

      expect(mockOnDeleteAlert).toHaveBeenCalledWith('alert-123');
      expect(toast.success).toHaveBeenCalledWith('Alert deleted', {
        description: 'Your price alert for Beginner Bag has been removed.',
      });
    });

    it('should show generic toast when item name is not provided', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      act(() => {
        result.current.notifyDelete('alert-123');
      });

      expect(mockOnDeleteAlert).toHaveBeenCalledWith('alert-123');
      expect(toast.success).toHaveBeenCalledWith('Alert deleted', {
        description: 'Your price alert has been removed.',
      });
    });
  });

  describe('notifyCreate', () => {
    it('should show toast for "below" condition', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      act(() => {
        result.current.notifyCreate('Beginner Bag', 'below', 500);
      });

      expect(toast.success).toHaveBeenCalledWith('Alert created!', {
        description: "You'll be notified when Beginner Bag price drops below 500.",
      });
    });

    it('should show toast for "above" condition', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      act(() => {
        result.current.notifyCreate('Expert Bag', 'above', 50000);
      });

      expect(toast.success).toHaveBeenCalledWith('Alert created!', {
        description: "You'll be notified when Expert Bag price goes above 50000.",
      });
    });

    it('should show toast with % for "change" condition', () => {
      const { result } = renderHook(() =>
        useAlertsFeedback({ onDeleteAlert: mockOnDeleteAlert })
      );

      act(() => {
        result.current.notifyCreate('Master Bag', 'change', 15);
      });

      expect(toast.success).toHaveBeenCalledWith('Alert created!', {
        description: "You'll be notified when Master Bag price changes by 15%.",
      });
    });
  });
});

