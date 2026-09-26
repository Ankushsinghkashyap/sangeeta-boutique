import React, { useState, useEffect } from 'react';
import { api, authStorage } from '../../api/client.ts';
import {
  ShieldCheck,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface AdminSecurityProps {
  onCredentialsUpdated?: (newEmail: string) => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({ onCredentialsUpdated }) => {
  // Current settings state
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');
  const [isCustomized, setIsCustomized] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggles for visibility
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Submission & feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Load current security status
  const fetchSecuritySettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getSecuritySettings();
      setCurrentUsername(data.currentUsername);
      setIsCustomized(data.isCustomized);
      setUpdatedAt(data.updatedAt);
      setNewUsername(data.currentUsername);
    } catch (err: any) {
      console.error('Failed to fetch security settings:', err);
      setErrorMessage(err.message || 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 25, text: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, text: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, text: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 15, text: 'Very Weak', color: 'bg-red-400' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current admin password to authorize changes.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    if (!newPassword && newUsername.trim() === currentUsername.trim()) {
      setErrorMessage('No changes detected. Please specify a new username or new password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.updateCredentials({
        currentPassword: currentPassword.trim(),
        newUsername: newUsername.trim() !== currentUsername.trim() ? newUsername.trim() : undefined,
        newPassword: newPassword ? newPassword.trim() : undefined,
      });

      setSuccessMessage(res.message || 'Admin credentials updated successfully!');
      setCurrentUsername(res.user.email);
      setIsCustomized(true);
      setUpdatedAt(new Date().toISOString());

      // Update stored user
      const existingUser = authStorage.getUser() || {};
      authStorage.setUser({ ...existingUser, email: res.user.email });
      if (onCredentialsUpdated) {
        onCredentialsUpdated(res.user.email);
      }

      // Reset sensitive fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update credentials. Please check current password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!resetPasswordInput) {
      setResetError('Please enter your current password to confirm reset.');
      return;
    }

    setResetting(true);
    setResetError(null);
    try {
      const res = await api.resetCredentialsToDefault(resetPasswordInput.trim());
      setSuccessMessage('Credentials successfully reset to factory defaults (ankushsinghkashyap34@gmail.com / Sangeeta2026!).');
      setCurrentUsername(res.user.email);
      setNewUsername(res.user.email);
      setIsCustomized(false);
      setUpdatedAt(null);
      setShowResetConfirm(false);
      setResetPasswordInput('');

      const existingUser = authStorage.getUser() || {};
      authStorage.setUser({ ...existingUser, email: res.user.email });
      if (onCredentialsUpdated) {
        onCredentialsUpdated(res.user.email);
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset credentials. Incorrect current password.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#8A7968] flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#6E1423]" />
        <span>Loading security status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#6E1423]">Admin Security & Password</h2>
        <p className="text-xs text-[#8A7968] mt-1">
          Safeguard your boutique management console by changing default credentials to a custom username and strong password.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security Status Card */}
      <div className="bg-white border border-[#EADBCE] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isCustomized
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {isCustomized ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#2B2320]">Current Administrator Account</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCustomized
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isCustomized ? 'Customized & Encrypted' : 'Using Factory Defaults'}
                </span>
              </div>
              <p className="text-xs text-[#8A7968] mt-0.5">
                Active Login Handle: <strong className="text-[#2B2320]">{currentUsername}</strong>
              </p>
              {updatedAt && (
                <p className="text-[11px] text-[#A69788] mt-0.5">
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {isCustomized && (
            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(true);
                setResetError(null);
                setResetPasswordInput('');
              }}
              className="text-xs text-[#8A7968] hover:text-[#6E1423] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto px-3 py-1.5 rounded-lg border border-[#EADBCE] hover:bg-[#FDFBF7]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          )}
        </div>

        {!isCustomized && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Security Recommendation:</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Your boutique portal is currently using standard system credentials. We recommend changing both the username/email and password below to prevent unauthorized access.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change Credentials Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#EADBCE] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#EADBCE] pb-4">
          <h3 className="font-serif text-lg font-bold text-[#6E1423] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#C59B27]" />
            <span>Update Username & Password</span>
          </h3>
          <p className="text-xs text-[#8A7968] mt-0.5">
            Enter your current password to verify your identity, then configure your new login credentials.
          </p>
        </div>

        {/* Step 1: Verify Current Password */}
        <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EADBCE] space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E1423]">
            1. Current Admin Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7968]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showCurrentPass ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password (e.g. Sangeeta2026!)"
              required
              className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs font-medium text-[#2B2320] focus:outline-none focus:border-[#6E1423] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass(!showCurrentPass)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A7968] hover:text-[#2B2320] cursor-pointer"
            >
              {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-[#8A7968] block">
            Required to confirm administrative authorization before changing credentials.
          </span>
        </div>

        {/* Step 2: New Username */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7968]">
            2. New Admin Username or Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7968]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. boutique_owner or sangeeta@boutique.com"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs font-medium text-[#2B2320] focus:outline-none focus:border-[#6E1423] transition-colors"
            />
          </div>
          <span className="text-[11px] text-[#8A7968]">
            You can enter your personal email address or a custom admin username.
          </span>
        </div>

        {/* Step 3: New Password & Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7968]">
              3. New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7968]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs font-medium text-[#2B2320] focus:outline-none focus:border-[#6E1423] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A7968] hover:text-[#2B2320] cursor-pointer"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#8A7968]">Password Strength:</span>
                  <span className="font-bold text-[#2B2320]">{strength.text}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7968]">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7968]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={!newPassword}
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs font-medium text-[#2B2320] focus:outline-none focus:border-[#6E1423] transition-colors disabled:bg-gray-50 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                disabled={!newPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A7968] hover:text-[#2B2320] cursor-pointer disabled:opacity-0"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && confirmPassword && (
              <div className="pt-1">
                {newPassword === confirmPassword ? (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                  </span>
                ) : (
                  <span className="text-[11px] text-red-500 font-semibold">
                    Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Info Box */}
        <div className="p-3.5 bg-[#F9F6F0] border border-[#EADBCE] rounded-lg text-xs text-[#6A5E57] space-y-1">
          <p className="font-semibold text-[#2B2320] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
            <span>Cryptographic Protection</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            Your credentials are salted with unique 128-bit cryptographic seeds and hashed using industry-standard PBKDF2 (100,000 rounds). Passwords are never stored in plaintext.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#E5C158]" />
                <span>Save New Credentials</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#EADBCE] p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#6E1423]">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#2B2320]">Reset to Default Credentials?</h4>
                <p className="text-xs text-[#8A7968]">This will restore standard credentials.</p>
              </div>
            </div>

            <p className="text-xs text-[#4A3E39] leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-[#EADBCE]">
              This will restore your login credentials back to:
              <br />
              • Username: <strong className="text-[#6E1423]">ankushsinghkashyap34@gmail.com</strong>
              <br />
              • Password: <strong className="text-[#6E1423]">Sangeeta2026!</strong>
            </p>

            {resetError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {resetError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2B2320]">
                Enter Current Password to Confirm:
              </label>
              <input
                type="password"
                value={resetPasswordInput}
                onChange={(e) => setResetPasswordInput(e.target.value)}
                placeholder="Current password"
                className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="px-4 py-2 border border-[#EADBCE] text-[#2B2320] hover:bg-[#F9F6F0] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={resetting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {resetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
