/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string
  // add more env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}