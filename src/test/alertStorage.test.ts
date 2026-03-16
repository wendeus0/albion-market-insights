import { describe, it, expect, beforeEach } from 'vitest';
import { AlertStorageService } from '@/services/alert.storage';
import type { Alert } from '@/data/types';

function makeAlert(id: string): Alert {
  return {
    id,
    itemId: `ITEM_${id}`,
    itemName: `Item ${id}`,
    city: 'Caerleon',
    condition: 'below',
    threshold: 10000,
    isActive: true,
    createdAt: new Date().toISOString(),
    notifications: { inApp: true, email: false },
  };
}

describe('AlertStorageService', () => {
  let service: AlertStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new AlertStorageService();
  });

  describe('getAlerts()', () => {
    it('retorna [] quando localStorage está vazio', () => {
      // Given: localStorage limpo (beforeEach)

      // When
      const alerts = service.getAlerts();

      // Then
      expect(alerts).toEqual([]);
    });

    it('retorna alertas previamente salvos', () => {
      // Given
      service.saveAlert(makeAlert('1'));
      service.saveAlert(makeAlert('2'));

      // When
      const alerts = service.getAlerts();

      // Then
      expect(alerts.length).toBe(2);
    });
  });

  describe('saveAlert()', () => {
    it('persiste alerta no localStorage', () => {
      // Given
      const alert = makeAlert('1');

      // When
      service.saveAlert(alert);

      // Then
      const raw = localStorage.getItem('albion_alerts');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed[0].id).toBe('1');
    });

    it('adiciona novo alerta à lista', () => {
      // Given
      service.saveAlert(makeAlert('1'));

      // When
      service.saveAlert(makeAlert('2'));

      // Then
      expect(service.getAlerts().length).toBe(2);
    });

    it('atualiza alerta existente sem duplicar', () => {
      // Given
      service.saveAlert(makeAlert('1'));

      // When
      service.saveAlert({ ...makeAlert('1'), isActive: false });

      // Then
      const alerts = service.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].isActive).toBe(false);
    });
  });

  describe('deleteAlert()', () => {
    it('remove alerta do localStorage', () => {
      // Given
      service.saveAlert(makeAlert('1'));
      service.saveAlert(makeAlert('2'));

      // When
      service.deleteAlert('1');

      // Then
      const alerts = service.getAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].id).toBe('2');
    });

    it('não falha ao tentar deletar id inexistente', () => {
      // Given
      service.saveAlert(makeAlert('1'));

      // When / Then
      expect(() => service.deleteAlert('999')).not.toThrow();
      expect(service.getAlerts().length).toBe(1);
    });
  });
});
