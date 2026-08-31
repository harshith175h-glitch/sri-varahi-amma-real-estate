import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck2, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Building2, 
  FileText,
  BadgeCheck
} from 'lucide-react';

interface SecurityBannerProps {
  onOpenPrivacyPolicy: () => void;
  onOpenSecurityProtocol: () => void;
  onOpenBrokerSettings: () => void;
}

export const SecurityBanner: React.FC<SecurityBannerProps> = ({
  onOpenPrivacyPolicy,
  onOpenSecurityProtocol,
  onOpenBrokerSettings,
}) => {
  return (
    <div className="w-full bg-[#1A1A1A] text-white py-3 px-4 sm:px-6 border-y border-[#333333] shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Side: HTTPS & Verified Badges */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6">
          
          {/* HTTPS SSL Badge */}
          <div className="flex items-center gap-2 bg-[#262626] px-3 py-1.5 rounded-full border border-[#3D3D3D]">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold tracking-wide">
              HTTPS 256-Bit SSL Encrypted
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Patta & Revenue Record */}
          <div className="flex items-center gap-2 text-[#D1C7BD]">
            <BadgeCheck className="w-4 h-4 text-[#C4A484] shrink-0" />
            <span>Government Patta & 30-Yr EC Checked</span>
          </div>

          {/* Direct Broker Desk Status */}
          <div className="hidden sm:flex items-center gap-2 text-[#D1C7BD]">
            <Clock className="w-3.5 h-3.5 text-[#C4A484] shrink-0" />
            <span>Broker Response: <strong className="text-white">&lt; 15 Mins</strong></span>
          </div>

        </div>

        {/* Right Side: Quick Action Links */}
        <div className="flex items-center gap-4 text-[11px] text-[#A89F91]">
          <button
            onClick={onOpenPrivacyPolicy}
            className="hover:text-white hover:underline flex items-center gap-1 transition"
          >
            <FileText className="w-3 h-3 text-[#C4A484]" />
            <span>Privacy Policy</span>
          </button>
          
          <span className="text-[#444]">•</span>

          <button
            onClick={onOpenSecurityProtocol}
            className="hover:text-white hover:underline flex items-center gap-1 transition"
          >
            <ShieldCheck className="w-3 h-3 text-[#C4A484]" />
            <span>Security & Title Protocol</span>
          </button>

          <span className="text-[#444]">•</span>

          <button
            onClick={onOpenBrokerSettings}
            className="hover:text-[#C4A484] text-[#C4A484] font-bold hover:underline flex items-center gap-1 transition"
          >
            <span>Edit Broker Contacts ⚙️</span>
          </button>
        </div>

      </div>
    </div>
  );
};
