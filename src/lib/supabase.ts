import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_secret_8LukMxkhqdSKvPrjJR7o6A_Dmeqr4Rb';

// Detect whether valid Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://xyzcompany.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Real client or mockable client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Mock persistent auth storage for sandbox/demo environment
const MOCK_STORAGE_KEY = 'structuralai_auth_user';
const MOCK_CONFIRMED_EMAILS_KEY = 'structuralai_confirmed_emails';

export interface MockUserSession {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organization: string;
  badgeNumber: string;
  isEmailConfirmed: boolean;
  token: string;
  createdAt: string;
}

export const MockAuth = {
  getStoredUser(): MockUserSession | null {
    try {
      const data = localStorage.getItem(MOCK_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setStoredUser(user: MockUserSession | null) {
    if (user) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    }
  },

  getConfirmedEmails(): string[] {
    try {
      const data = localStorage.getItem(MOCK_CONFIRMED_EMAILS_KEY);
      return data ? JSON.parse(data) : ['inspector.sharma@cpwd.gov.in', 'lead.auditor@infraeng.in', 'ritovashk@gmail.com'];
    } catch {
      return ['inspector.sharma@cpwd.gov.in', 'lead.auditor@infraeng.in'];
    }
  },

  confirmEmail(email: string) {
    const list = this.getConfirmedEmails();
    if (!list.includes(email.toLowerCase())) {
      list.push(email.toLowerCase());
      localStorage.setItem(MOCK_CONFIRMED_EMAILS_KEY, JSON.stringify(list));
    }
  }
};
