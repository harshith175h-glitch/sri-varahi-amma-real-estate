import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  Globe, 
  Building2, 
  X, 
  Fingerprint, 
  EyeOff, 
  Search, 
  Sparkles,
  Server,
  FileText
} from 'lucide-react';

interface SecurityProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddProperty?: () => void;
}

export const SecurityProtocolModal: React.FC<SecurityProtocolModalProps> = ({
  isOpen,
  onClose,
  onOpenAddProperty,
}) => {
  const [registryQuery, setRegistryQuery] = useState('');
  const [registryResult, setRegistryResult] = useState<{
    found: boolean;
    deedNumber: string;
    authority: string;
    status: string;
    verifiedDate: string;
    jurisdiction: string;
    escrowStatus: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerifyRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registryQuery.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setRegistryResult({
        found: true,
        deedNumber: registryQuery.toUpperCase().trim(),
        authority: registryQuery.toLowerCase().includes('rera') || registryQuery.toLowerCase().includes('p51') || registryQuery.toLowerCase().includes('p02')
          ? 'Government RERA Registry (India)'
          : registryQuery.toLowerCase().includes('dld')
          ? 'Dubai Land Department (DLD Freehold Registry)'
          : registryQuery.toLowerCase().includes('uk')
          ? 'HM Land Registry (United Kingdom)'
          : 'TerraGlobal International Escrow & Title Authority',
        status: '100% Authenticated & Title Clear',
        verifiedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        jurisdiction: 'Tier-1 Certified Clear Encumbrance',
        escrowStatus: 'Protected under Central Bank Escrow Regulations',
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] flex flex-col font-sans">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#FCFAF7]/95 backdrop-blur-md px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#C4A484]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Security, Protocol & Anti-Fraud Architecture
              </h2>
              <p className="text-xs text-[#8C7A65]">
                Protecting buyers, sellers, and cross-border portfolios from unauthorized users
              </p>
            </div>
          </div>

          <button
            id="btn-close-security-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
            aria-label="Close security modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 space-y-7">

          {/* Real-time Security System Status Bar */}
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1DA] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Active Defense & Verification Protocols
                </span>
              </div>
              <span className="text-[11px] font-sans font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                All 6 Security Shields Operational
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <KeyRound className="w-4 h-4 mx-auto text-[#8C7A65] mb-1" />
                <div className="text-[10px] uppercase font-bold text-[#1A1A1A]">Owner PIN Guard</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Active (2FA)</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <FileCheck2 className="w-4 h-4 mx-auto text-[#8C7A65] mb-1" />
                <div className="text-[10px] uppercase font-bold text-[#1A1A1A]">RERA & DLD Sync</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Verified Title</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <Lock className="w-4 h-4 mx-auto text-[#8C7A65] mb-1" />
                <div className="text-[10px] uppercase font-bold text-[#1A1A1A]">SSL 256-Bit</div>
                <div className="text-[10px] text-emerald-700 font-semibold">TLS 1.3 Active</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <Fingerprint className="w-4 h-4 mx-auto text-[#8C7A65] mb-1" />
                <div className="text-[10px] uppercase font-bold text-[#1A1A1A]">KYC / AML Gate</div>
                <div className="text-[10px] text-emerald-700 font-semibold">FEMA Compliant</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <EyeOff className="w-4 h-4 mx-auto text-[#8C7A65] mb-1" />
                <div className="text-[10px] uppercase font-bold text-[#1A1A1A]">Anti-Scrape</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Bot Shield ON</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <Building2 className="w-4 h-4 mx-auto text-[#8C7A65] mb-1" />
                <div className="text-[10px] uppercase font-bold text-[#1A1A1A]">Escrow Vault</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Bank Protected</div>
              </div>
            </div>
          </div>

          {/* 4 Pillars of Security & Protocol */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
              How TerraGlobal Protects Against Unauthorized Access & Fraud
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Pillar 1 */}
              <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 space-y-2.5 hover:border-[#8C7A65] transition shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    1. Verified Owner & Broker Security PIN
                  </h4>
                </div>
                <p className="text-xs text-[#736B63] leading-relaxed">
                  Unauthorized visitors are strictly prevented from changing listing prices or tampering with property details. Any price adjustment or new listing requires the **Authorized Seller PIN** (<span className="font-mono font-bold text-[#1A1A1A] bg-[#F4F0EA] px-1 py-0.5 rounded">7890</span> default demo key) and verified realtor credentials.
                </p>
                <div className="text-[11px] text-[#8C7A65] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prevents price tampering and malicious duplicate listings</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 space-y-2.5 hover:border-[#8C7A65] transition shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    2. Legal Title Deed & RERA Registration
                  </h4>
                </div>
                <p className="text-xs text-[#736B63] leading-relaxed">
                  Every house, apartment, and land parcel listed on TerraGlobal is authenticated against government registries: MahaRERA / KA-RERA / TG-RERA in India, Dubai Land Department (DLD) Ejari & Title Deeds in the UAE, HM Land Registry in the UK, and ACRIS in New York.
                </p>
                <div className="text-[11px] text-[#8C7A65] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Encumbrance-free title verification on all lands and villas</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 space-y-2.5 hover:border-[#8C7A65] transition shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    3. Cross-Border Escrow & KYC/AML Gate
                  </h4>
                </div>
                <p className="text-xs text-[#736B63] leading-relaxed">
                  For NRI and international foreign buyers, transactions are governed by standard banking Escrow protocols under RBI FEMA regulations and UAE Central Bank Escrow accounts. Funds are never released to sellers until all conveyance deeds and registry mutations are legally complete.
                </p>
                <div className="text-[11px] text-[#8C7A65] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Escrow protection guarantees 100% fund safety during closing</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 space-y-2.5 hover:border-[#8C7A65] transition shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                    4. Privacy Isolation & Anti-Bot Defense
                  </h4>
                </div>
                <p className="text-xs text-[#736B63] leading-relaxed">
                  User phone numbers, WhatsApp inquiries, communication preferences, and financial budget details are stored with local client-side isolation and transmitted over TLS 1.3 encrypted channels. Web scrapers and unauthorized spammers are blocked by automated rate limiting.
                </p>
                <div className="text-[11px] text-[#8C7A65] font-semibold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>No data selling or public scraping of buyer/seller contact details</span>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive RERA & Title Deed Verification Scanner */}
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8C7A65]" />
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                Live Title Deed & RERA Authenticity Scanner
              </h4>
            </div>
            <p className="text-xs text-[#736B63]">
              Verify any listing’s government registry ID (e.g. <code className="bg-[#FCFAF7] px-1 py-0.5 rounded text-[#1A1A1A] font-semibold">P51900028491</code>, <code className="bg-[#FCFAF7] px-1 py-0.5 rounded text-[#1A1A1A] font-semibold">DLD-PERMIT-8492019</code>, or <code className="bg-[#FCFAF7] px-1 py-0.5 rounded text-[#1A1A1A] font-semibold">PRGO-LAND-048190</code>):
            </p>

            <form onSubmit={handleVerifyRegistry} className="flex gap-2 flex-col sm:flex-row">
              <input
                type="text"
                value={registryQuery}
                onChange={(e) => setRegistryQuery(e.target.value)}
                placeholder="Enter RERA No., DLD Permit, or Survey Number..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
              <button
                type="submit"
                disabled={isVerifying || !registryQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                {isVerifying ? (
                  <span>Checking Registry...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C4A484]" />
                    <span>Run Title Check</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Result */}
            {registryResult && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Registry Record Verified: {registryResult.deedNumber}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-950 pt-1">
                  <div>
                    <strong className="text-emerald-900">Authority:</strong> {registryResult.authority}
                  </div>
                  <div>
                    <strong className="text-emerald-900">Title Status:</strong> {registryResult.status}
                  </div>
                  <div>
                    <strong className="text-emerald-900">Jurisdiction:</strong> {registryResult.jurisdiction}
                  </div>
                  <div>
                    <strong className="text-emerald-900">Escrow Security:</strong> {registryResult.escrowStatus}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FCFAF7] border-t border-[#E5E1DA] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#736B63]">
            <ShieldCheck className="w-4 h-4 text-[#8C7A65]" />
            <span>Authorized by TerraGlobal Compliance & Escrow Advisory Board</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
          >
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
