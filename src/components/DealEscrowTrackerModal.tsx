import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  X, 
  Building2, 
  Wallet, 
  Calendar, 
  FileText, 
  MapPin, 
  CreditCard,
  Lock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { DealTransaction, UserAccount, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';

interface DealEscrowTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  currentCurrency: CurrencyCode;
  onOpenDocumentWallet: () => void;
}

const INITIAL_TRANSACTION: DealTransaction = {
  id: 'DEAL-IN-2026-991',
  propertyId: 'prop-morjim-land',
  propertyTitle: 'Morjim Coconut Grove Beachfront Land Parcel',
  propertyCity: 'Goa',
  propertyPriceINR: 118000000,
  buyerName: 'Harshith Real Estate Group',
  vendorName: 'Capt. Desmond Fernandes (Landowner)',
  serviceMode: 'hybrid',
  earnestTokenINR: 2000000,
  escrowStatus: 'Legal Title Cleared',
  brokerDesk: 'Sri Varahi Amma Real Estate (Direct Brokerage)',
  createdAt: '2026-08-18',
  milestones: [
    {
      id: 'm-1',
      title: 'Earnest Token Secured in Neutral Escrow',
      description: '₹20,00,000 earnest deposit deposited in Central Bank-regulated neutral trust account.',
      status: 'completed',
      mode: 'online',
      dateCompleted: '2026-08-18',
    },
    {
      id: 'm-2',
      title: 'Patta & 30-Year Encumbrance Search Cleared',
      description: 'Revenue records and physical Patta inspected; 30-year nil encumbrance certified.',
      status: 'completed',
      mode: 'offline',
      dateCompleted: '2026-08-21',
    },
    {
      id: 'm-3',
      title: 'Physical Survey Pegs & Boundary Demarcation',
      description: 'Revenue Surveyor marked all corner boundaries on-site with concrete pillars.',
      status: 'completed',
      mode: 'offline',
      dateCompleted: '2026-08-23',
    },
    {
      id: 'm-4',
      title: 'Sub-Registrar Slot Booking & Sale Deed Draft',
      description: 'Conveyance Deed drafted and Sub-Registrar biometric registration slot reserved.',
      status: 'current',
      mode: 'hybrid',
    },
    {
      id: 'm-5',
      title: 'Final In-Person Registration & Escrow Settlement',
      description: 'Biometric thumbprint registration at Sub-Registrar office and simultaneous funds release.',
      status: 'pending',
      mode: 'offline',
    },
  ],
};

export const DealEscrowTrackerModal: React.FC<DealEscrowTrackerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentCurrency,
  onOpenDocumentWallet,
}) => {
  const [deal, setDeal] = useState<DealTransaction>(INITIAL_TRANSACTION);
  const [activeTab, setActiveTab] = useState<'timeline' | 'escrow_wallet' | 'sub_registrar'>('timeline');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] flex flex-col font-sans">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#FCFAF7]/95 backdrop-blur-md px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Deal & Escrow Wallet Tracker
              </h2>
              <p className="text-xs text-[#8C7A65]">
                {deal.propertyTitle} • Deal ID: <span className="font-mono">{deal.id}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-deal-tracker"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
            aria-label="Close deal tracker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 space-y-6">

          {/* Deal Summary Bento Card */}
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1DA] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block">
                  Property in Transaction
                </span>
                <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                  {deal.propertyTitle}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block">
                  Total Deal Value
                </span>
                <div className="font-serif font-bold text-base text-[#1A1A1A]">
                  {formatPrice(deal.propertyPriceINR, currentCurrency)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A65] block mb-0.5">Buyer</span>
                <p className="font-bold text-[#1A1A1A]">{deal.buyerName}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A65] block mb-0.5">Vendor / Landowner</span>
                <p className="font-bold text-[#1A1A1A]">{deal.vendorName}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <span className="text-[10px] uppercase font-bold text-[#8C7A65] block mb-0.5">Managing Broker</span>
                <p className="font-bold text-[#1A1A1A]">{deal.brokerDesk}</p>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-2 border-b border-[#E5E1DA] pb-3 flex-wrap">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'timeline'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
              }`}
            >
              5-Step Milestone Pipeline
            </button>

            <button
              onClick={() => setActiveTab('escrow_wallet')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'escrow_wallet'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
              }`}
            >
              What is Escrow & Tokens? (Simple Guide)
            </button>

            <button
              onClick={() => setActiveTab('sub_registrar')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'sub_registrar'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
              }`}
            >
              Sub-Registrar In-Person Slot
            </button>
          </div>

          {/* Milestone Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] text-xs text-[#736B63] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Current Status: <strong className="text-[#1A1A1A]">{deal.escrowStatus}</strong></span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Step 4 of 5 In Progress
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E1DA]">
                {deal.milestones.map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className={`relative flex items-start gap-4 p-4 rounded-2xl border transition ${
                      milestone.status === 'completed'
                        ? 'bg-white border-emerald-200'
                        : milestone.status === 'current'
                        ? 'bg-white border-[#1A1A1A] shadow-md ring-1 ring-[#1A1A1A]'
                        : 'bg-[#FCFAF7] border-[#E5E1DA] opacity-75'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs z-10 ${
                      milestone.status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : milestone.status === 'current'
                        ? 'bg-[#1A1A1A] text-white animate-pulse'
                        : 'bg-white border border-[#E5E1DA] text-[#736B63]'
                    }`}>
                      {milestone.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                          {milestone.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full uppercase ${
                            milestone.mode === 'offline' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
                          }`}>
                            {milestone.mode === 'offline' ? '🤝 Offline In-Person' : '⚡ Digital Escrow'}
                          </span>
                          {milestone.dateCompleted && (
                            <span className="text-[11px] text-[#8C7A65] font-mono">{milestone.dateCompleted}</span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#736B63]">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escrow Wallet Tab */}
          {activeTab === 'escrow_wallet' && (
            <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#8C7A65]" />
                  <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                    Neutral Escrow & Token Protection Explained
                  </h3>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Zero-Risk Buyer Guarantee
                </span>
              </div>

              {/* Clear Explanation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-amber-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>What is "Neutral Escrow"?</span>
                  </h4>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    In traditional property deals, buyers pay an advance directly to the seller. If the seller later has land disputes or fake documents, getting your money back is difficult.
                  </p>
                  <p className="text-xs font-semibold text-amber-900">
                    <strong>With Neutral Escrow:</strong> Your money is NOT given to the seller right away. It is held in a <em>neutral bank trust account</em> regulated by the Central Bank.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>What are "Tokens Secured in Escrow"?</span>
                  </h4>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    A "Token" (or Earnest Deposit) is the initial booking advance (e.g. ₹20,00,000) that reserves the land exclusively for you.
                  </p>
                  <p className="text-xs font-semibold text-emerald-900">
                    The token remains <strong>locked safely</strong> until the original Patta and 30-year title are certified clear. If any dispute or defect is found, 100% of your token is refunded immediately.
                  </p>
                </div>
              </div>

              {/* Current Deal Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8C7A65]">Earnest Token in Escrow</span>
                  <div className="text-xl font-serif font-bold text-[#1A1A1A]">
                    {formatPrice(deal.earnestTokenINR, currentCurrency)}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Locked safely until Patta is verified
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8C7A65]">Final Balance Due at Sub-Registrar</span>
                  <div className="text-xl font-serif font-bold text-[#1A1A1A]">
                    {formatPrice(deal.propertyPriceINR - deal.earnestTokenINR, currentCurrency)}
                  </div>
                  <p className="text-[11px] text-[#736B63]">
                    Released only after biometric deed registration
                  </p>
                </div>
              </div>

              {/* Title & Survey Verification Process */}
              <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8C7A65]" />
                  <h4 className="font-serif font-bold text-xs text-[#1A1A1A]">
                    Patta Title & Boundary Verification Process
                  </h4>
                </div>
                <p className="text-xs text-[#736B63] leading-relaxed">
                  Our verification desk inspects original revenue archives (Patta, Chitta, UDR, 7/12, EC 15), validates licensed surveyor boundary pegs on the parcel, and authorizes escrow release only when the property title is 100% dispute-free.
                </p>
              </div>
            </div>
          )}

          {/* Sub-Registrar In-Person Slot Tab */}
          {activeTab === 'sub_registrar' && (
            <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E5E1DA] pb-3">
                <Building2 className="w-5 h-5 text-[#8C7A65]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                    Sub-Registrar Physical Conveyance Appointment
                  </h3>
                  <p className="text-xs text-[#736B63]">Government Sub-Registrar Office, Bardez / Mapusa, Goa</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5E1DA]">
                  <span className="text-[#8C7A65]">Date & Time:</span>
                  <span className="font-bold text-[#1A1A1A]">Thursday, 28 August 2026 at 11:30 AM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E1DA]">
                  <span className="text-[#8C7A65]">Documents to Bring:</span>
                  <span className="font-bold text-[#1A1A1A]">Original PAN, Aadhaar & 2 Passport Photos</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8C7A65]">Broker Coordinator on Site:</span>
                  <span className="font-bold text-[#1A1A1A]">Sri Varahi Amma Real Estate Team</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FCFAF7] border-t border-[#E5E1DA] px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenDocumentWallet();
            }}
            className="text-xs font-semibold text-[#8C7A65] hover:text-[#1A1A1A] flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Check Patta & Documents</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
};
