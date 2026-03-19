import { toast } from 'sonner';
import type { Alert, MarketItem } from '@/data/types';

interface UseAlertsFeedbackOptions {
  onDeleteAlert: (id: string) => void;
}

interface UseAlertsFeedbackReturn {
  notifyToggle: (alert: Alert) => void;
  notifyDelete: (id: string, itemName?: string) => void;
  notifyCreate: (itemName: string, condition: Alert['condition'], threshold: number) => void;
}

/**
 * Hook para gerenciamento de feedback/toasts do AlertsManager.
 * Centraliza todas as notificações Sonner em um único lugar.
 */
export function useAlertsFeedback({
  onDeleteAlert,
}: UseAlertsFeedbackOptions): UseAlertsFeedbackReturn {
  const notifyToggle = (alert: Alert) => {
    const status = alert.isActive ? 'disabled' : 'enabled';
    toast.success(`Alert ${status}`, {
      description: `Your alert for ${alert.itemName} has been ${status}.`,
    });
  };

  const notifyDelete = (id: string, itemName?: string) => {
    onDeleteAlert(id);
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

