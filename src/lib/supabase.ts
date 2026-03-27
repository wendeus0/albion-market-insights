import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'placeholder-anon-key';

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function resolveSupabaseUrl(url?: string): string {
  return url && url.trim().length > 0 ? url : FALLBACK_SUPABASE_URL;
}

function resolveSupabaseAnonKey(key?: string): string {
  return key && key.trim().length > 0 ? key : FALLBACK_SUPABASE_ANON_KEY;
}

export const supabase = createSupabaseClient(
  resolveSupabaseUrl(supabaseUrl),
  resolveSupabaseAnonKey(supabaseAnonKey),
);
