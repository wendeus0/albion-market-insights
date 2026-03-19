import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Alert, MarketItem } from '@/data/types';
import { alertFormSchema, type AlertFormValues } from '@/lib/schemas';

/**
 * Gera ID único para alertas usando crypto.randomUUID quando disponível
 * Fallback seguro para browsers antigos
 */
function generateAlertId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

interface UseAlertsFormOptions {
  onSaveAlert: (alert: Alert) => void;
  availableItems: MarketItem[];
}

interface UseAlertsFormReturn {
  form: ReturnType<typeof useForm<AlertFormValues>>;
  alertType: string;
  createAlert: (values: AlertFormValues) => Alert | null;
  resetForm: () => void;
}

/**
 * Hook para gerenciamento do formulário de criação de alertas.
 * Encapsula validação, valores padrão e criação do objeto Alert.
 */
export function useAlertsForm({
  onSaveAlert,
  availableItems,
}: UseAlertsFormOptions): UseAlertsFormReturn {
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      itemId: '',
      city: 'all',
      condition: 'below',
      threshold: undefined,
      notifications: { inApp: true, email: false },
    },
  });

  const alertType = form.watch('condition');

  const createAlert = (values: AlertFormValues): Alert | null => {
    const item = availableItems.find(i => i.itemId === values.itemId);
    
    if (!item) {
      return null;
    }

    const newAlert: Alert = {
      id: generateAlertId(),
      itemId: values.itemId,
      itemName: item.itemName || 'Unknown Item',
      city: values.city,
      condition: values.condition,
      threshold: values.threshold,
      isActive: true,
      createdAt: new Date().toISOString(),
      notifications: values.notifications,
    };

    onSaveAlert(newAlert);
    return newAlert;
  };

  const resetForm = () => {
    form.reset();
  };

  return {
    form,
    alertType,
    createAlert,
    resetForm,
  };
}

// Exportar generateAlertId para uso externo se necessário
export { generateAlertId };

