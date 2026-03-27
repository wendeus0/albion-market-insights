import { toast } from 'sonner';
import type { Alert } from '@/data/types';

interface UseAlertsFeedbackReturn {
  notifyToggle: (alert: Alert) => void;
  notifyDelete: (itemName?: string) => void;
  notifyCreate: (itemName: string, condition: Alert['condition'], threshold: number) => void;
}

/**
 * Hook para gerenciamento de feedback/toasts do AlertsManager.
 * Centraliza todas as notificações Sonner em um único lugar.
 */
export function useAlertsFeedback(): UseAlertsFeedbackReturn {
  const notifyToggle = (alert: Alert) => {
    const status = alert.isActive ? 'disabled' : 'enabled';
    toast.success(`Alert ${status}`, {
      description: `Your alert for ${alert.itemName} has been ${status}.`,
    });
  };

  const notifyDelete = (itemName?: string) => {
    toast.success('Alert deleted', {
      description: itemName 
        ? `Your price alert for ${itemName} has been removed.`
        : 'Your price alert has been removed.',
    });
  };

  const notifyCreate = (itemName: string, condition: Alert['condition'], threshold: number) => {
    const conditionText = condition === 'below' 
      ? 'drops below' 
      : condition === 'above' 
        ? 'goes above' 
        : 'changes by';
    const suffix = condition === 'change' ? '%' : '';

    toast.success('Alert created!', {
      description: `You'll be notified when ${itemName} price ${conditionText} ${threshold}${suffix}.`,
    });
  };

  return {
    notifyToggle,
    notifyDelete,
    notifyCreate,
  };
}
