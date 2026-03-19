import { useState, useEffect, useCallback } from 'react';
import {
  checkCooldown,
  recordRefresh,
  formatTimeRemaining,
  type CooldownState,
} from '@/services/refreshCooldown';

export interface UseRefreshCooldownReturn {
  canRefresh: boolean;
  timeRemaining: number;
  formattedTime: string;
  recordRefresh: () => void;
  refreshState: CooldownState;
}

export function useRefreshCooldown(): UseRefreshCooldownReturn {
  const [state, setState] = useState<CooldownState>(checkCooldown());

  // Atualiza o estado a cada segundo quando em cooldown
  useEffect(() => {
    if (state.canRefresh) return;

    const interval = setInterval(() => {
      const newState = checkCooldown();
      setState(newState);
      
      if (newState.canRefresh) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.canRefresh]);

  const handleRecordRefresh = useCallback(() => {
    recordRefresh();
    setState(checkCooldown());
  }, []);

  return {
    canRefresh: state.canRefresh,
    timeRemaining: state.timeRemaining,
    formattedTime: formatTimeRemaining(state.timeRemaining),
    recordRefresh: handleRecordRefresh,
    refreshState: state,
  };
}

