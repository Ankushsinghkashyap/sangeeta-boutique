import React, { useState } from 'react';
import { api } from '../../api/client.ts';
import { auth, googleAuthProvider } from '../../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';
import { Scissors, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToWebsite,
}) => {
  const [email, setEmail] = useState('ankushsinghkashyap34@gmail.com');
  const [password, setPassword] = useState('Sangeeta2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      const user = {
        email: result.user.email,
        name: result.user.displayName || 'Admin',
        role: 'admin',
        uid: result.user.uid,
      };
      api.setAuthSession(token, user);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F2EB] to-[#FDFBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EADBCE] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#6E1423] text-white p-8 text-center space-y-2 relative">
          <div className="w-14 h-14 rounded-full bg-[#E5C158] text-[#6E1423] mx-auto flex items-center justify-center shadow-md">
            <Scissors className="w-7 h-7 -rotate-45" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-[#FDFBF7]">
            Sangeeta Boutique
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#E5C158] font-semibold">
            Admin CMS & Tailoring Management
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2B2320] mb-1">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ankushsinghkashyap34@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2320] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Boutique CMS'}</span>
              <ArrowRight className="w-4 h-4 text-[#E5C158]" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-[#EADBCE]"></div>
            <span className="shrink mx-4 text-[11px] text-[#8A7968] uppercase font-semibold">
              Or Sign In With
            </span>
            <div className="grow border-t border-[#EADBCE]"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-white border border-[#EADBCE] hover:bg-[#F9F6F0] text-[#2B2320] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Default Credentials Info */}
          <div className="p-3 bg-[#FCF8EC] border border-[#E5C158]/60 rounded-lg text-xs text-[#8C6D1F] space-y-1">
            <p className="font-semibold flex items-center justify-between">
              <span>Admin Login Credentials:</span>
              <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded text-[#6E1423] font-bold">Customizable</span>
            </p>
            <p>Default: <span className="font-mono font-bold text-[#6E1423]">ankushsinghkashyap34@gmail.com</span></p>
            <p>Password: <span className="font-mono font-bold text-[#6E1423]">Sangeeta2026!</span></p>
            <p className="text-[11px] text-[#A68024] pt-0.5">
              💡 If you updated your username or password in the Security settings, use your new custom credentials above.
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onBackToWebsite}
              className="text-xs text-[#8A7968] hover:text-[#6E1423] font-medium"
            >
              ← Return to Public Customer Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
