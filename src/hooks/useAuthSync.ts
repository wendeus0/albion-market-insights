import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/useAuth';
import { marketService } from '@/services';
import { supabase } from '@/lib/supabase';
import { SupabaseAlertStorageService } from '@/services/alert.storage.supabase';
import { AlertStorageService } from '@/services/alert.storage';
import type { IAlertStorage } from '@/data/types';
import { getAlertsQueryKey } from '@/hooks/useAlerts';

const MIGRATION_FLAG_PREFIX = 'albion_alerts_migrated_';
function getMigrationFlag(userId: string): string {
  return `${MIGRATION_FLAG_PREFIX}${userId}`;
}

async function migrateLocalStorageAlerts(
  supabaseStorage: IAlertStorage,
  userId: string,
): Promise<void> {
  const flag = getMigrationFlag(userId);
  if (localStorage.getItem(flag)) return;

  const alerts = new AlertStorageService().getAlerts();
  if (alerts.length === 0) return;

  for (const alert of alerts) {
    try {
      await supabaseStorage.saveAlert(alert);
    } catch {
      // Migração best-effort — não bloqueia em caso de erro individual
    }
  }

  localStorage.setItem(flag, new Date().toISOString());
}

type SettableService = typeof marketService & { setStorage: (s: IAlertStorage) => void };

export function useAuthSync(): void {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const hadUser = useRef(false);

  useEffect(() => {
    const settable = marketService as SettableService;
    let cancelled = false;

    if (user) {
      hadUser.current = true;
      const supabaseStorage = new SupabaseAlertStorageService(supabase, user.id);
      settable.setStorage(supabaseStorage);
      queryClient.removeQueries({ queryKey: ['alerts'] });
      migrateLocalStorageAlerts(supabaseStorage, user.id).then(() => {
        if (cancelled) return;
        queryClient.invalidateQueries({ queryKey: getAlertsQueryKey(user.id) });
      });
    } else if (hadUser.current) {
      settable.setStorage(new AlertStorageService());
      queryClient.removeQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: getAlertsQueryKey(null) });
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}
