import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Building2, 
  CheckCircle2,
  KeyRound,
  Sparkles,
  Inbox
} from 'lucide-react';
import { UserAccount } from '../types';
import { requestOtp, verifyOtp, verifyBrokerPin, setSessionToken } from '../utils/api';
import { readJSON, writeJSON } from '../utils/storage';

import { useDialogA11y } from '../hooks/useDialogA11y';
interface AuthAndUserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (user: UserAccount) => void;
  onOpenDocumentWallet?: () => void;
  onOpenDealTracker?: () => void;
  onAddPropertyShortcut?: () => void;
  onOpenOwnerDesk?: () => void;
}

export const AuthAndUserAccountModal: React.FC<AuthAndUserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onAddPropertyShortcut,
  onOpenOwnerDesk,
}) => {
  const [activeTab, setActiveTab] = useState<'buyer_signin' | 'broker_signin'>('buyer_signin');
  
  // Buyer form fields (Completely blank by default, clean placeholders)
  const [buyerName, setBuyerName] = useState(currentUser.isLoggedIn && currentUser.role === 'buyer' ? currentUser.name : '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.isLoggedIn && currentUser.role === 'buyer' ? currentUser.phone : '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser.isLoggedIn && currentUser.role === 'buyer' ? currentUser.email : '');
  
  // Phone OTP Flow for Customers
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  /** Set only when the API returned a development code (never in production). */
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  /** True when the deployment has no API at all (static hosting). */
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Broker master PIN login (verified by the server, never in the bundle)
  const [brokerPin, setBrokerPin] = useState('');
  const [brokerPinError, setBrokerPinError] = useState(false);

  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  // Step 1: ask the server to send an OTP to the customer's mobile
  const handleRequestCustomerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!buyerName.trim()) {
      setAuthError('Please enter your name.');
      return;
    }
    if (buyerPhone.replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestOtp(buyerPhone.trim());
    setIsSubmitting(false);
    setDevOtpHint(null);

    if (res.offline) {
      // Static hosting without the API: allow a clearly-labelled local session
      // so the UI remains usable, but never claim the number was verified.
      setIsOfflineMode(true);
      setShowOtpScreen(true);
      return;
    }

    if (!res.ok) {
      setAuthError(res.data?.error || 'Could not send the OTP right now. Please try again.');
      return;
    }

    if (res.data?.devCode) setDevOtpHint(res.data.devCode);
    setIsOfflineMode(false);
    setShowOtpScreen(true);
  };

  // Step 2: the server checks the OTP (no client-side bypass codes)
  const handleVerifyCustomerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const code = otpCode.trim();
    if (!/^[0-9]{4,6}$/.test(code)) {
      setAuthError('Enter the 4-digit code you received by SMS.');
      return;
    }

    setIsSubmitting(true);
    const res = isOfflineMode
      ? { ok: true, status: 200, data: { token: 'offline-local-session' }, offline: true }
      : await verifyOtp(buyerPhone.trim(), code);
    setIsSubmitting(false);

    if (!res.ok || !res.data?.token) {
      setAuthError(res.data?.error || 'That code is incorrect or has expired. Please request a new one.');
      return;
    }

    setSessionToken(res.data.token);

    const cleanPhone = buyerPhone.trim();
    const updatedUser: UserAccount = {
      id: `buyer-${Date.now()}`,
      name: buyerName.trim(),
      phone: cleanPhone,
      email: buyerEmail.trim(),
      role: 'buyer',
      isLoggedIn: true,
      // A phone OTP proves the number, not identity documents. KYC stays
      // "pending" until the Document Wallet review completes.
      kycStatus: 'Pending',
      preferredLanguage: 'English',
      preferredServiceMode: 'offline_in_person',
      walletBalanceINR: 0,
      escrowLockedINR: 0,
      memberSince: String(new Date().getFullYear()),
    };

    onUpdateUser(updatedUser);
    setShowOtpScreen(false);
    setOtpCode('');
    onClose();

    // Local backup of the lead in case the CRM hand-off failed earlier.
    const storedLeads = readJSON<Array<Record<string, unknown>>>('inquiries', []);
    writeJSON('inquiries', [
      {
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        type: 'buyer_signin',
        timestamp: new Date().toISOString(),
      },
      ...storedLeads,
    ].slice(0, 200));
  };

  // Owner / Broker Master Login — the PIN is verified by the server against a
  // hashed value (BROKER_PIN_HASH / BROKER_PIN env var). Hard-coded PINs used to
  // ship inside this bundle, so anyone reading the JavaScript owned the desk.
  const handleBrokerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!/^[0-9]{4,8}$/.test(brokerPin.trim())) {
      setBrokerPinError(true);
      return;
    }

    setIsSubmitting(true);
    const res = await verifyBrokerPin(brokerPin.trim());
    setIsSubmitting(false);

    if (res.ok && res.data?.token) {
      setSessionToken(res.data.token);
      const brokerUser: UserAccount = {
        id: 'owner-harshith-01',
        name: 'Harshith (Owner & Lead Realtor)',
        phone: '+91 6383040407',
        email: 'harshith175h@gmail.com',
        role: 'agent',
        isLoggedIn: true,
        kycStatus: 'Verified',
        preferredLanguage: 'English',
        preferredServiceMode: 'offline_in_person',
        walletBalanceINR: 0,
        escrowLockedINR: 0,
        memberSince: '2026',
      };
      onUpdateUser(brokerUser);
      setBrokerPinError(false);
      setBrokerPin('');
      onClose();
      if (onAddPropertyShortcut) {
        onAddPropertyShortcut();
      }
      return;
    }

    setBrokerPinError(true);
    setAuthError(
      res.offline
        ? 'The owner desk requires the application server. This deployment is running as static files only.'
        : res.data?.error || 'Incorrect security PIN. Please enter your authorised PIN.'
    );
  };

  const handleSignOut = () => {
    onUpdateUser({
      id: 'guest-buyer',
      name: 'Guest Buyer',
      email: '',
      phone: '',
      role: 'buyer',
      isLoggedIn: false,
      kycStatus: 'Pending',
      preferredLanguage: 'English',
      preferredServiceMode: 'offline_in_person',
      walletBalanceINR: 0,
      escrowLockedINR: 0,
      memberSince: '2026',
    });
    setShowOtpScreen(false);
    onClose();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-[#FCFAF7] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#E6E0D5] my-auto">
        
        {/* Header */}
        <div className="bg-[#171513] text-[#F5F2EB] p-5 flex items-center justify-between border-b border-[#2A2622]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2A2520] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">
                {currentUser.isLoggedIn ? 'Account Profile' : 'Sign In with Mobile OTP'}
              </h2>
              <p className="text-[11px] text-[#A89E92] font-sans">
                {currentUser.isLoggedIn 
                  ? `Signed in as ${currentUser.name}` 
                  : 'Fast & Secure verification for land buyers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A89E92] hover:text-white hover:bg-[#2A2520] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {currentUser.isLoggedIn ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E6E0D5] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#786F64]">Name:</span>
                <span className="text-xs font-bold text-[#171513]">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#786F64]">Mobile:</span>
                <span className="text-xs font-bold text-[#171513]">{currentUser.phone || '—'}</span>
              </div>
              {currentUser.email && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#786F64]">Email:</span>
                  <span className="text-xs font-medium text-[#171513]">{currentUser.email}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-[#F0EBE1]">
                <span className="text-xs text-[#786F64]">Status:</span>
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB] inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {currentUser.role === 'agent' ? 'Owner / Admin' : 'Verified Buyer'}
                </span>
              </div>
            </div>

            {currentUser.role === 'agent' && onOpenOwnerDesk && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOwnerDesk();
                }}
                className="w-full py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EFE8] border border-[#DCD6C8] text-[#171513] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <Inbox className="w-4 h-4 text-[#8C7A65]" aria-hidden="true" />
                <span>Owner Desk — Enquiries & Listings</span>
              </button>
            )}

            {currentUser.role === 'agent' && onAddPropertyShortcut && (
              <button
                onClick={() => {
                  onClose();
                  onAddPropertyShortcut();
                }}
                className="w-full py-3 rounded-2xl bg-[#171513] hover:bg-black text-[#D4AF37] text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>+ List New Land / Plot (Admin)</span>
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-2xl border border-[#DCD6C8] text-[#C93B2B] hover:bg-rose-50 text-xs font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            {/* Tabs for Customer vs Owner */}
            <div className="grid grid-cols-2 border-b border-[#E6E0D5] bg-[#FAF7F2] text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('buyer_signin');
                  setShowOtpScreen(false);
                }}
                className={`py-3 text-center transition-colors ${
                  activeTab === 'buyer_signin'
                    ? 'bg-white text-[#171513] border-b-2 border-[#171513] font-bold shadow-2xs'
                    : 'text-[#786F64] hover:text-[#171513]'
                }`}
              >
                Customer Phone OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('broker_signin');
                  setShowOtpScreen(false);
                }}
                className={`py-3 text-center transition-colors ${
                  activeTab === 'broker_signin'
                    ? 'bg-white text-[#171513] border-b-2 border-[#171513] font-bold shadow-2xs'
                    : 'text-[#786F64] hover:text-[#171513]'
                }`}
              >
                Owner / Broker Login
              </button>
            </div>

            {/* Customer Sign-In (Clean, No Pre-filled Mock Data) */}
            {activeTab === 'buyer_signin' ? (
              <div className="p-6 space-y-4">
                {!showOtpScreen ? (
                  <form onSubmit={handleRequestCustomerOtp} className="space-y-3.5">
                    <p className="text-xs text-[#736B63] leading-relaxed">
                      Enter your mobile number to receive a 4-digit SMS OTP to save shortlisted plots and request site visits.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-[#171513] mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8C7A65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DCD6C8] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#171513] bg-white text-[#171513]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171513] mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#8C7A65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DCD6C8] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#171513] bg-white text-[#171513]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171513] mb-1">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8C7A65] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          placeholder="your.email@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DCD6C8] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#171513] bg-white text-[#171513]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-2xl bg-[#171513] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
                        <span>{isSubmitting ? 'Sending…' : 'Send 4-Digit OTP Code'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCustomerOtp} className="space-y-4 bg-white p-5 rounded-2xl border border-[#E6E0D5] shadow-xs">
                    <div className="text-center space-y-1">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/50 flex items-center justify-center text-[#171513] mx-auto">
                        <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="font-serif font-bold text-sm text-[#171513]">Enter 4-Digit Mobile OTP</h3>
                      <p className="text-xs text-[#736B63] leading-relaxed">
                        {isOfflineMode
                          ? 'This deployment has no messaging service connected, so no SMS could be sent.'
                          : <>A 4-digit verification code has been sent to <strong className="text-[#171513]">{buyerPhone}</strong> via SMS / WhatsApp.</>}
                      </p>
                    </div>

                    {isOfflineMode && (
                      <div role="status" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                        <strong>Preview mode:</strong> no SMS provider or backend is configured, so any 4 digits will open a
                        local-only session. Your number is <strong>not verified</strong>.
                      </div>
                    )}

                    {devOtpHint && (
                      <div role="status" className="p-3 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/50 text-[11px] text-[#5C4A1E] text-center">
                        Development code: <strong className="font-mono tracking-widest">{devOtpHint}</strong>
                      </div>
                    )}

                    {authError && (
                      <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
                        {authError}
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="• • • •"
                        className="w-full py-3 rounded-xl border border-[#171513] text-center text-xl font-mono font-bold tracking-widest text-[#171513] bg-[#FCFAF7] focus:outline-none focus:ring-2 focus:ring-[#171513]"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowOtpScreen(false)}
                        className="flex-1 py-2.5 rounded-xl border border-[#DCD6C8] text-xs font-semibold text-[#786F64] hover:bg-[#FAF7F2]"
                      >
                        Edit Number
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className="flex-2 py-2.5 rounded-xl bg-[#171513] hover:bg-black disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider shadow-xs"
                      >
                        {isSubmitting ? 'Verifying…' : 'Verify OTP'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Owner / Broker Master PIN Login */
              <form onSubmit={handleBrokerLogin} className="p-6 space-y-4">
                <p className="text-xs text-[#736B63] leading-relaxed">
                  Enter your owner master PIN to access the listing management desk.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#171513] mb-1">
                    Owner Security PIN *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C7A65] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={brokerPin}
                      onChange={(e) => {
                        setBrokerPin(e.target.value);
                        setBrokerPinError(false);
                      }}
                      placeholder="Enter security PIN"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DCD6C8] text-xs font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#171513] bg-white"
                      autoFocus
                    />
                  </div>
                  {(brokerPinError || authError) && (
                    <p role="alert" className="text-[11px] text-rose-600 mt-1 font-medium text-center">
                      {authError || 'Incorrect security PIN. Please enter your authorised PIN.'}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#171513] hover:bg-black text-[#D4AF37] text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Access Owner Desk</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="bg-[#FAF7F2] border-t border-[#E6E0D5] p-3.5 text-center text-[10px] text-[#786F64] flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Direct Owner Dealings • Sri Varahi Amma Real Estate</span>
        </div>

      </div>
    </div>
  );
};
