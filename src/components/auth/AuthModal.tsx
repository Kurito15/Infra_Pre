import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Building2, BadgeCheck, AlertCircle, ArrowRight, RefreshCw, KeyRound, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isLoading,
    isSupabaseLive,
    emailConfirmationPending,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmationEmail,
    confirmEmailInstantly,
    signInAsDemo,
    clearEmailConfirmationPending,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Senior Structural Auditor (Grade I)');
  const [organization, setOrganization] = useState('Central Public Works Dept (CPWD)');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const res = await signUp({
          email,
          password,
          fullName: fullName || email.split('@')[0],
          role,
          organization,
          badgeNumber: badgeNumber || `CPWD-${Math.floor(1000 + Math.random() * 9000)}`,
        });
        if (res.error) {
          setError(res.error);
        } else if (res.requireEmailConfirmation) {
          setSuccessMsg('Confirmation link has been dispatched to your email address.');
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMsg(res.message || 'Password reset link sent.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!emailConfirmationPending && !email) return;
    const targetEmail = emailConfirmationPending || email;
    const res = await resendConfirmationEmail(targetEmail);
    if (res.error) setError(res.error);
    else setSuccessMsg(res.message || 'Verification link re-sent.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header with Indian Engineering Product Branding */}
        <div className="bg-[#0B192C] px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">StructuralAI Identity</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                  isSupabaseLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isSupabaseLive ? 'Supabase Live' : 'Supabase Auth Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Indian Infrastructure Inspection & Audit Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User is already signed in view */}
        {user ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="h-12 w-12 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-base">
                {user.fullName?.charAt(0) || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{user.fullName}</h4>
                  <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-600 truncate">{user.role}</p>
                <p className="text-[11px] text-slate-400 font-mono">{user.email} &bull; {user.badgeNumber}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Switch Role / Quick Demo Profile:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => signInAsDemo('chief')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">CPWD Lead</div>
                  <div className="text-[10px] text-slate-500">Er. A. Sharma</div>
                </button>
                <button
                  type="button"
                  onClick={() => signInAsDemo('field')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">DMRC Expert</div>
                  <div className="text-[10px] text-slate-500">Dr. P. Nair</div>
                </button>
                <button
                  type="button"
                  onClick={() => signInAsDemo('cpwd')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900">NHAI Bridge</div>
                  <div className="text-[10px] text-slate-500">Er. R. Verma</div>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setMode('signin');
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out Session
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up / Forgot Password Forms */
          <div className="p-6 space-y-5">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-2.5 px-4 transition-colors relative ${
                  mode === 'signin'
                    ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-2.5 px-4 transition-colors relative ${
                  mode === 'signup'
                    ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up (New Inspector)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`pb-2.5 px-4 transition-colors relative ${
                  mode === 'forgot'
                    ? 'text-blue-700 border-b-2 border-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Forgot Password
              </button>
            </div>

            {/* Email Confirmation Alert Banner if pending */}
            {emailConfirmationPending && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Email Confirmation Required</strong>
                    Confirmation link sent to: <span className="font-mono font-bold">{emailConfirmationPending}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="px-2.5 py-1 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Confirmation
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmEmailInstantly(emailConfirmationPending)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                  >
                    Quick Confirm & Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Error or Success alerts */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Full Name & Title
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Er. Rajesh K. Verma"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Role / Designation</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 text-xs"
                      >
                        <option value="Senior Structural Auditor (Grade I)">Senior Structural Auditor</option>
                        <option value="Chief Forensic Concrete Specialist">Forensic Concrete Specialist</option>
                        <option value="Executive Civil Engineer">Executive Civil Engineer</option>
                        <option value="NHAI Bridge Inspector">NHAI Bridge Inspector</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Organization / Wing</label>
                      <select
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 text-xs"
                      >
                        <option value="Central Public Works Dept (CPWD)">CPWD Northern Region</option>
                        <option value="Delhi Metro Rail Corporation (DMRC)">DMRC Infrastructure</option>
                        <option value="National Highways Authority of India (NHAI)">NHAI Highway Safety</option>
                        <option value="L&T Infrastructure Civil Engineering">L&T Civil Engineering</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="inspector.name@cpwd.gov.in"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {mode === 'signin' ? 'Sign In to Infrastructure Portal' : mode === 'signup' ? 'Create Certified Inspector Account' : 'Dispatch Password Reset Link'}
                {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>

            {/* Quick Demo Login Preset Buttons */}
            <div className="pt-3 border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                Or One-Click Demo Access
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    signInAsDemo('chief');
                    onClose();
                  }}
                  className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors"
                >
                  <div className="font-bold text-xs text-slate-900">Lead CPWD Auditor</div>
                  <div className="text-[10px] text-slate-500">Er. Arjun Sharma</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signInAsDemo('field');
                    onClose();
                  }}
                  className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors"
                >
                  <div className="font-bold text-xs text-slate-900">DMRC Specialist</div>
                  <div className="text-[10px] text-slate-500">Dr. Priya Nair</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
