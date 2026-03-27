import { useEffect, useMemo, useRef } from 'react';
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

interface UseAlertsFormReturn {
  form: ReturnType<typeof useForm<AlertFormValues>>;
  alertType: string;
  createAlert: (values: AlertFormValues) => Alert | null;
  resetForm: () => void;
  suggestedThreshold: number | null;
}

/**
 * Hook para gerenciamento do formulário de criação de alertas.
 * Encapsula validação, valores padrão e criação do objeto Alert.
 */
function getRelevantPrices(
  availableItems: MarketItem[],
  itemId: string,
  quality: string,
  city: string,
): number[] {
  return availableItems
    .filter(
      (item) => item.itemId === itemId && item.quality === quality && (city === 'all' || item.city === city),
    )
    .flatMap((item) => [item.sellPrice, item.buyPrice])
    .filter((price) => Number.isFinite(price) && price > 0);
}

export function getSuggestedThreshold(
  availableItems: MarketItem[],
  itemId: string,
  quality: string,
  city: string,
  condition: Alert['condition'],
): number | null {
  const prices = getRelevantPrices(availableItems, itemId, quality, city);
  if (prices.length === 0) return condition === 'change' ? 10 : null;

  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  if (condition === 'change') return 10;

  const multiplier = condition === 'below' ? 0.95 : 1.05;
  return Math.max(1, Math.round(averagePrice * multiplier));
}

export function useAlertsForm({
  availableItems,
}: {
  availableItems: MarketItem[];
}): UseAlertsFormReturn {
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      itemId: '',
      quality: '',
      city: 'all',
      condition: 'below',
      threshold: undefined,
      notifications: { inApp: true, email: false },
    },
  });

  const alertType = form.watch('condition');
  const selectedItemId = form.watch('itemId');
  const selectedQuality = form.watch('quality');
  const selectedCity = form.watch('city');
  const threshold = form.watch('threshold');
  const lastAutoThreshold = useRef<number | null>(null);

  const suggestedThreshold = useMemo(
    () => getSuggestedThreshold(availableItems, selectedItemId, selectedQuality, selectedCity, alertType),
    [alertType, availableItems, selectedCity, selectedItemId, selectedQuality],
  );

  useEffect(() => {
    if (suggestedThreshold === null) return;

    const currentThreshold = form.getValues('threshold');
    const thresholdDirty = form.formState.dirtyFields.threshold;
    const wasManuallyEdited =
      thresholdDirty && currentThreshold !== undefined && currentThreshold !== lastAutoThreshold.current;

    if (currentThreshold === undefined || currentThreshold === lastAutoThreshold.current || !wasManuallyEdited) {
      form.setValue('threshold', suggestedThreshold, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
      lastAutoThreshold.current = suggestedThreshold;
    }
  }, [form, suggestedThreshold]);

  const createAlert = (values: AlertFormValues): Alert | null => {
    const item = availableItems.find((i) => i.itemId === values.itemId && i.quality === values.quality);
    
    if (!item) {
      return null;
    }

    const newAlert: Alert = {
      id: generateAlertId(),
      itemId: values.itemId,
      itemName: item.itemName || 'Unknown Item',
      quality: values.quality,
      city: values.city,
      condition: values.condition,
      threshold: values.threshold,
      isActive: true,
      createdAt: new Date().toISOString(),
      notifications: values.notifications,
    };

    return newAlert;
  };

  const resetForm = () => {
    form.reset();
    lastAutoThreshold.current = null;
  };

  return {
    form,
    alertType,
    createAlert,
    resetForm,
    suggestedThreshold,
  };
}

// Exportar generateAlertId para uso externo se necessário
export { generateAlertId };
