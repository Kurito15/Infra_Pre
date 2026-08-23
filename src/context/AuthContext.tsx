import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, MockAuth, MockUserSession } from '../lib/supabase';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  emailConfirmationPending: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    organization: string;
    badgeNumber?: string;
  }) => Promise<{ error?: string; requireEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ error?: string; message?: string }>;
  confirmEmailManually: (email: string) => void;
  clearEmailConfirmationPending: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState<string | null>(null);

  // Initialize session on mount - STRICT: No default demo user
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Inspector',
              role: session.user.user_metadata?.role || 'Field Structural Engineer',
              organization: session.user.user_metadata?.organization || 'National Infrastructure Audit',
              badgeNumber: session.user.user_metadata?.badge_number || `IND-ENG-${session.user.id.slice(0, 4)}`,
              confirmedAt: session.user.confirmed_at || undefined,
              lastSignInAt: session.user.last_sign_in_at || new Date().toISOString(),
            });
          } else {
            // Check local verified user session
            const stored = MockAuth.getStoredUser();
            if (stored && stored.isEmailConfirmed) {
              setUser({
                id: stored.id,
                email: stored.email,
                fullName: stored.fullName,
                role: stored.role,
                organization: stored.organization,
                badgeNumber: stored.badgeNumber,
                confirmedAt: stored.createdAt,
              });
            } else {
              setUser(null);
            }
          }

          // Listen to auth state changes from Supabase
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Inspector',
                role: session.user.user_metadata?.role || 'Field Structural Engineer',
                organization: session.user.user_metadata?.organization || 'National Infrastructure Audit',
                badgeNumber: session.user.user_metadata?.badge_number || `IND-ENG-${session.user.id.slice(0, 4)}`,
                confirmedAt: session.user.confirmed_at || undefined,
                lastSignInAt: session.user.last_sign_in_at || new Date().toISOString(),
              });
            } else {
              const stored = MockAuth.getStoredUser();
              if (!stored || !stored.isEmailConfirmed) {
                setUser(null);
              }
            }
          });

          return () => subscription.unsubscribe();
        } else {
          // Local storage session check
          const stored = MockAuth.getStoredUser();
          if (stored && stored.isEmailConfirmed) {
            setUser({
              id: stored.id,
              email: stored.email,
              fullName: stored.fullName,
              role: stored.role,
              organization: stored.organization,
              badgeNumber: stored.badgeNumber,
              confirmedAt: stored.createdAt,
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth initialization check:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  // Sign In with email & password
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setEmailConfirmationPending(email.trim());
            return { error: 'Please confirm your email address before signing in.' };
          }
          return { error: error.message };
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: data.user.user_metadata?.role || 'Field Structural Engineer',
            organization: data.user.user_metadata?.organization || 'National Infrastructure Audit',
            badgeNumber: data.user.user_metadata?.badge_number || `IND-ENG-${data.user.id.slice(0, 4)}`,
            confirmedAt: data.user.confirmed_at || undefined,
            lastSignInAt: new Date().toISOString(),
          });
          setEmailConfirmationPending(null);
          return {};
        }
      }

      // Local authentication
      if (!email.includes('@') || password.length < 6) {
        return { error: 'Please provide a valid email and minimum 6-character password.' };
      }

      const confirmedList = MockAuth.getConfirmedEmails();
      const isConfirmed = confirmedList.includes(email.toLowerCase());

      if (!isConfirmed) {
        setEmailConfirmationPending(email);
        return { error: 'Email confirmation required. Please verify your email to access the dashboard.' };
      }

      const mockSession: MockUserSession = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: email.trim(),
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: 'Certified Infrastructure Inspector (IS 456)',
        organization: email.includes('gov') ? 'CPWD Technical Audit Board' : 'Civil Engineering Audit Bureau',
        badgeNumber: `CPWD-${Math.floor(1000 + Math.random() * 9000)}`,
        isEmailConfirmed: true,
        token: `jwt_session_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      MockAuth.setStoredUser(mockSession);
      setUser({
        id: mockSession.id,
        email: mockSession.email,
        fullName: mockSession.fullName,
        role: mockSession.role,
        organization: mockSession.organization,
        badgeNumber: mockSession.badgeNumber,
        confirmedAt: mockSession.createdAt,
      });
      setEmailConfirmationPending(null);
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign in. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up with email & password + metadata
  const signUp = async ({
    email,
    password,
    fullName,
    role,
    organization,
    badgeNumber,
  }: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    organization: string;
    badgeNumber?: string;
  }): Promise<{ error?: string; requireEmailConfirmation?: boolean }> => {
    setIsLoading(true);
    try {
      const bNumber = badgeNumber || `ENG-${Math.floor(1000 + Math.random() * 9000)}`;

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              organization: organization,
              badge_number: bNumber,
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user && !data.session) {
          setEmailConfirmationPending(email.trim());
          return { requireEmailConfirmation: true };
        }

        if (data.user && data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            fullName,
            role,
            organization,
            badgeNumber: bNumber,
            confirmedAt: data.user.confirmed_at || new Date().toISOString(),
          });
          return {};
        }
      }

      // Local Sign Up Flow
      if (!email.includes('@') || password.length < 6) {
        return { error: 'Please provide a valid email and password with at least 6 characters.' };
      }

      setEmailConfirmationPending(email);
      return { requireEmailConfirmation: true };
    } catch (err: any) {
      return { error: err?.message || 'Sign up encountered an unexpected error.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (error) return { error: error.message };
        return { message: `Password reset email dispatched to ${email}. Please check your inbox.` };
      }

      return {
        message: `Password reset instructions sent to ${email}.`,
      };
    } catch (err: any) {
      return { error: err?.message || 'Failed to dispatch reset email.' };
    }
  };

  // Resend email confirmation
  const resendConfirmationEmail = async (email: string): Promise<{ error?: string; message?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
        });
        if (error) return { error: error.message };
        return { message: `Confirmation email resent to ${email}.` };
      }

      return { message: `Verification email resent to ${email}.` };
    } catch (err: any) {
      return { error: err?.message || 'Failed to resend confirmation.' };
    }
  };

  // Manual confirmation action for local testing
  const confirmEmailManually = (email: string) => {
    MockAuth.confirmEmail(email);
    setEmailConfirmationPending(null);
    signIn(email, 'test-password-123');
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      MockAuth.setStoredUser(null);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEmailConfirmationPending = useCallback(() => {
    setEmailConfirmationPending(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabaseLive: isSupabaseConfigured,
        emailConfirmationPending,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendConfirmationEmail,
        confirmEmailManually,
        clearEmailConfirmationPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
