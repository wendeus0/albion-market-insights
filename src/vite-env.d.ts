/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_API: string;
  readonly VITE_USE_PROXY: string;
  readonly VITE_PROXY_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
