import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public frontend Supabase configuration
// Frontend-safe publishable credentials for browser authentication & database access
export const SUPABASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://dsoxqjkjujcmqxikzxdd.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_-peCUvZj6xxyspvktIMdvQ_HI5h6I5t';

// Evaluate Supabase configuration state from active frontend values
export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_PUBLISHABLE_KEY.includes('YOUR_')
);

// Supabase client instance created from public frontend credentials
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
