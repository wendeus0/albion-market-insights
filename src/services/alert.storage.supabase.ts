import type { SupabaseClient } from '@supabase/supabase-js';
import type { Alert, IAlertStorage } from '@/data/types';
import { alertSchema } from '@/lib/schemas';

function mapRowToAlert(row: Record<string, unknown>): Alert {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    itemName: row.item_name as string,
    quality: (row.quality as string | undefined) ?? 'Normal',
    city: row.city as string,
    condition: row.condition as Alert['condition'],
    threshold: row.threshold as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    notifications: row.notifications as Alert['notifications'],
  };
}

function mapAlertToRow(alert: Alert, userId: string): Record<string, unknown> {
  return {
    id: alert.id,
    user_id: userId,
    item_id: alert.itemId,
    item_name: alert.itemName,
    quality: alert.quality,
    city: alert.city,
    condition: alert.condition,
    threshold: alert.threshold,
    is_active: alert.isActive,
    created_at: alert.createdAt,
    notifications: alert.notifications,
  };
}

export class SupabaseAlertStorageService implements IAlertStorage {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async getAlerts(): Promise<Alert[]> {
    const { data, error } = await this.client
      .from('alerts')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!data) return [];

    return (data as Record<string, unknown>[])
      .map(mapRowToAlert)
      .filter((a): a is Alert => alertSchema.safeParse(a).success);
  }

  async saveAlert(alert: Alert): Promise<void> {
    const { error } = await this.client
      .from('alerts')
      .upsert(mapAlertToRow(alert, this.userId));

    if (error) throw new Error(error.message);
  }

  async deleteAlert(id: string): Promise<void> {
    const { error } = await this.client
      .from('alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId);

    if (error) throw new Error(error.message);
  }
}
