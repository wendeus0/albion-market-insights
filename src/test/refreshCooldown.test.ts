import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkCooldown,
  recordRefresh,
  formatTimeRemaining,
  clearCooldown,
  COOLDOWN_KEY,
} from '@/services/refreshCooldown';

describe('refreshCooldown', () => {
  beforeEach(() => {
    clearCooldown();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearCooldown();
  });

  describe('checkCooldown', () => {
    it('should allow refresh when no cooldown exists', () => {
      const state = checkCooldown();
      expect(state.canRefresh).toBe(true);
      expect(state.timeRemaining).toBe(0);
      expect(state.lastRefresh).toBeNull();
    });

    it('should block refresh during cooldown', () => {
      recordRefresh();
      const state = checkCooldown();
      expect(state.canRefresh).toBe(false);
      expect(state.timeRemaining).toBeGreaterThan(0);
      expect(state.timeRemaining).toBeLessThanOrEqual(300); // 5 minutos em segundos
    });

    it('should allow refresh after cooldown expires', () => {
      recordRefresh();
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000); // 5 minutos + 1 segundo
      const state = checkCooldown();
      expect(state.canRefresh).toBe(true);
      expect(state.timeRemaining).toBe(0);
    });

    it('should update timeRemaining correctly', () => {
      recordRefresh();
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutos
      const state = checkCooldown();
      expect(state.timeRemaining).toBeGreaterThan(0);
      expect(state.timeRemaining).toBeLessThanOrEqual(180); // 3 minutos restantes
    });
  });

  describe('recordRefresh', () => {
    it('should record refresh timestamp', () => {
      const before = Date.now();
      recordRefresh();
      const after = Date.now();
      
      const stored = localStorage.getItem(COOLDOWN_KEY);
      expect(stored).not.toBeNull();
      
      const timestamp = parseInt(stored!, 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should block subsequent refreshes immediately after recording', () => {
      recordRefresh();
      const state = checkCooldown();
      expect(state.canRefresh).toBe(false);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format seconds correctly', () => {
      expect(formatTimeRemaining(0)).toBe('0:00');
      expect(formatTimeRemaining(30)).toBe('0:30');
      expect(formatTimeRemaining(60)).toBe('1:00');
      expect(formatTimeRemaining(90)).toBe('1:30');
      expect(formatTimeRemaining(300)).toBe('5:00');
    });

    it('should pad seconds with zero', () => {
      expect(formatTimeRemaining(5)).toBe('0:05');
      expect(formatTimeRemaining(65)).toBe('1:05');
    });
  });

  describe('clearCooldown', () => {
    it('should remove cooldown from localStorage', () => {
      recordRefresh();
      expect(localStorage.getItem(COOLDOWN_KEY)).not.toBeNull();
      
      clearCooldown();
      expect(localStorage.getItem(COOLDOWN_KEY)).toBeNull();
    });

    it('should allow refresh after clearing', () => {
      recordRefresh();
      clearCooldown();
      
      const state = checkCooldown();
      expect(state.canRefresh).toBe(true);
    });
  });
});

