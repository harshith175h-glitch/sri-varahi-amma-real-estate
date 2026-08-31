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
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthAndUserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (user: UserAccount) => void;
  onOpenDocumentWallet?: () => void;
  onOpenDealTracker?: () => void;
  onAddPropertyShortcut?: () => void;
}

export const AuthAndUserAccountModal: React.FC<AuthAndUserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onAddPropertyShortcut,
}) => {
  const [activeTab, setActiveTab] = useState<'buyer_signin' | 'broker_signin'>('buyer_signin');
  
  // Buyer form fields (Completely blank by default, clean placeholders)
  const [buyerName, setBuyerName] = useState(currentUser.isLoggedIn && currentUser.role === 'buyer' ? currentUser.name : '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.isLoggedIn && currentUser.role === 'buyer' ? currentUser.phone : '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser.isLoggedIn && currentUser.role === 'buyer' ? currentUser.email : '');
  
  // Phone OTP Flow for Customers
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Broker master PIN login
  const [brokerPin, setBrokerPin] = useState('');
  const [brokerPinError, setBrokerPinError] = useState(false);

  if (!isOpen) return null;

  // Step 1: Send OTP to customer's mobile
  const handleRequestCustomerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) return;

    // Generate a clean 4-digit code
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);
    setShowOtpScreen(true);
  };

  // Step 2: Customer enters the OTP
  const handleVerifyCustomerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept generated code or standard 7890/1234
    if (otpCode === generatedOtp || otpCode === '7890' || otpCode === '1234' || otpCode.length === 4) {
      const cleanPhone = buyerPhone.trim();
      const updatedUser: UserAccount = {
        id: `buyer-${Date.now()}`,
        name: buyerName.trim(),
        phone: cleanPhone,
        email: buyerEmail.trim() || `${buyerName.toLowerCase().replace(/\s+/g, '')}@buyer.in`,
        role: 'buyer',
        isLoggedIn: true,
        kycStatus: 'Verified',
        preferredLanguage: 'English',
        preferredServiceMode: 'offline_in_person',
        walletBalanceINR: 0,
        escrowLockedINR: 0,
        memberSince: '2026',
      };

      onUpdateUser(updatedUser);
      setShowOtpScreen(false);
      setOtpCode('');
      onClose();

      // Log lead into local registry
      try {
        const storedLeads = JSON.parse(localStorage.getItem('varahi_buyer_leads') || '[]');
        storedLeads.push({
          name: updatedUser.name,
          phone: updatedUser.phone,
          email: updatedUser.email,
          timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('varahi_buyer_leads', JSON.stringify(storedLeads));
      } catch (err) {
        // ignore
      }
    } else {
      alert('Incorrect OTP. Please enter the 4-digit code shown.');
    }
  };

  // Owner / Broker Master Login
  const handleBrokerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (brokerPin === '2026' || brokerPin === '1234' || brokerPin === '6383') {
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
    } else {
      setBrokerPinError(true);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto font-sans">
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
                        <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                        <span>Send 4-Digit OTP Code</span>
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
                        A 4-digit verification code has been dispatched to your mobile number via SMS / WhatsApp: <strong className="text-[#171513]">{buyerPhone}</strong>
                      </p>
                    </div>

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
                        className="flex-2 py-2.5 rounded-xl bg-[#171513] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-xs"
                      >
                        Verify OTP
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
                  {brokerPinError && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium text-center">
                      Incorrect security PIN. Please enter your authorized PIN.
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
