import { ArrowDown, ArrowUp, Percent } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Alert } from '@/data/types';

interface ConditionIconResult {
  icon: ReactNode;
  className: string;
}

interface UseAlertsUIReturn {
  getConditionIcon: (condition: Alert['condition']) => ReactNode;
  getConditionText: (alert: Alert) => string;
  getCityLabel: (city: string) => string;
  getConditionStyles: (condition: Alert['condition']) => { icon: ReactNode; className: string };
}

/**
 * Hook para helpers de UI do AlertsManager.
 * Centraliza formatação de texto, ícones e labels.
 */
export function useAlertsUI(): UseAlertsUIReturn {
  const getConditionIcon = (condition: Alert['condition']): ReactNode => {
    switch (condition) {
      case 'below': 
        return <ArrowDown className="h-4 w-4 text-success" />;
      case 'above': 
        return <ArrowUp className="h-4 w-4 text-destructive" />;
      case 'change': 
        return <Percent className="h-4 w-4 text-primary" />;
      default: 
        return null;
    }
  };

  const getConditionStyles = (condition: Alert['condition']): ConditionIconResult => {
    switch (condition) {
      case 'below':
        return {
          icon: <ArrowDown className="h-4 w-4" />,
          className: 'text-success',
        };
      case 'above':
        return {
          icon: <ArrowUp className="h-4 w-4" />,
          className: 'text-destructive',
        };
      case 'change':
        return {
          icon: <Percent className="h-4 w-4" />,
          className: 'text-primary',
        };
      default:
        return {
          icon: null,
          className: '',
        };
    }
  };

  const getConditionText = (alert: Alert): string => {
    switch (alert.condition) {
      case 'below': 
        return `Price below ${alert.threshold.toLocaleString()}`;
      case 'above': 
        return `Price above ${alert.threshold.toLocaleString()}`;
      case 'change': 
        return `Price change ≥ ${alert.threshold}%`;
    }
  };

  const getCityLabel = (city: string): string => {
    return city === 'all' ? 'All Cities' : city;
  };

  return {
    getConditionIcon,
    getConditionText,
    getCityLabel,
    getConditionStyles,
  };
}

