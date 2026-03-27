import { describe, it, expect } from 'vitest';
import { createSupabaseClient } from '@/lib/supabase';

describe('supabase bootstrap', () => {
  it('cria client com placeholders validos quando env nao estiver configurada', async () => {
    const client = createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
    );

    await expect(client.auth.getSession()).resolves.toEqual({
      data: { session: null },
      error: null,
    });
  });
});
