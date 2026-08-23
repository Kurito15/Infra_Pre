import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect whether valid Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http')
);

if (!isSupabaseConfigured) {
  console.error(
    'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

// Supabase client instance (Strict Supabase Auth only)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://unconfigured.supabase.co',
  supabaseAnonKey || 'unconfigured-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
