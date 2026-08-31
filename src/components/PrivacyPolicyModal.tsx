import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  X, 
  CheckCircle2, 
  Eye, 
  Server, 
  PhoneCall, 
  Scale, 
  Building2,
  AlertCircle
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white px-6 py-5 border-b border-[#E5E1DA] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#C4A484] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">Privacy Policy & Client Data Protection</h2>
              <p className="text-xs text-[#8C7A65]">Sri Varahi Amma Real Estate • Strict Confidentiality & RERA Compliance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#736B63] hover:text-[#1A1A1A] hover:bg-[#F4F0EA] rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#333333] leading-relaxed">
          
          {/* HTTPS & Security Highlight */}
          <div className="p-4 rounded-xl bg-[#F4F0EA] border border-[#E5E1DA] flex items-start gap-3.5">
            <Lock className="w-5 h-5 text-[#8C7A65] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#1A1A1A] text-sm">256-Bit SSL/TLS HTTPS Encrypted Connection</p>
              <p className="text-[#736B63]">
                Every connection to Sri Varahi Amma Real Estate is protected with end-to-end HTTPS encryption. Your identity, inquiries, property searches, and financial parameters are never transmitted over unencrypted channels.
              </p>
            </div>
          </div>

          {/* Section 1: Data Collection */}
          <div className="space-y-2">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#C4A484] flex items-center justify-center text-xs font-sans font-bold">1</span>
              Information We Collect
            </h3>
            <p className="text-xs text-[#555]">
              We only collect necessary information provided willingly by property buyers and landowners to facilitate genuine property transactions, including:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#555] pt-1">
              <li className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E1DA]">
                <CheckCircle2 className="w-4 h-4 text-[#8C7A65] shrink-0" />
                <span>Contact details (Name, WhatsApp, Phone, Email)</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E1DA]">
                <CheckCircle2 className="w-4 h-4 text-[#8C7A65] shrink-0" />
                <span>Property location preferences & budgets</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E1DA]">
                <CheckCircle2 className="w-4 h-4 text-[#8C7A65] shrink-0" />
                <span>Land listing details (Patta, Survey numbers)</span>
              </li>
              <li className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E1DA]">
                <CheckCircle2 className="w-4 h-4 text-[#8C7A65] shrink-0" />
                <span>Preferred consultation language & times</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Use of Information */}
          <div className="space-y-2">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#C4A484] flex items-center justify-center text-xs font-sans font-bold">2</span>
              How We Use Your Data
            </h3>
            <p className="text-xs text-[#555]">
              Your personal information is used strictly by our licensed broker team at Sri Varahi Amma Real Estate for:
            </p>
            <div className="space-y-2 text-xs text-[#555]">
              <div className="p-3 bg-white rounded-lg border border-[#E5E1DA]">
                <strong className="text-[#1A1A1A]">Direct Broker Consultation:</strong> Arranging in-person site visits, sharing official land documents, and coordinating via WhatsApp or phone.
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E1DA]">
                <strong className="text-[#1A1A1A]">Zero Third-Party Data Selling:</strong> We NEVER sell, rent, or lease your phone number or email to telemarketers, cold-callers, or outside marketing agencies.
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E1DA]">
                <strong className="text-[#1A1A1A]">Sub-Registrar Registration Support:</strong> Facilitating verified deed documentation and token escrow protection.
              </div>
            </div>
          </div>

          {/* Section 3: Document Confidentiality */}
          <div className="space-y-2">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#C4A484] flex items-center justify-center text-xs font-sans font-bold">3</span>
              Land Documents & Patta Records Privacy
            </h3>
            <p className="text-xs text-[#555]">
              Title deeds, 30-year Encumbrance Certificates (EC), and Revenue Patta passbooks uploaded or inspected in person are kept under strict confidentiality. Sensitive owner personal details (Aadhaar numbers, PAN cards) are masked during preliminary public listings and only shared between buyer and seller during formal Sub-Registrar deed execution.
            </p>
          </div>

          {/* Section 4: Contact & Data Deletion */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E1DA] space-y-2">
            <h4 className="font-bold text-[#1A1A1A] text-xs uppercase tracking-wider">Need to update or delete your information?</h4>
            <p className="text-xs text-[#736B63]">
              You have full rights to request deletion of your listed properties, phone numbers, or inquiry history at any time by contacting our broker desk directly.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F4F0EA] px-6 py-4 border-t border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#8C7A65]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Updated & Active: 2026 Compliance Standard</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition"
          >
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
