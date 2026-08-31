import React, { useState } from 'react';
import { 
  Sun, 
  Clock, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Key
} from 'lucide-react';
import { getTodayPanchangam } from '../utils/panchangam';

interface AuspiciousMuhurthamBannerProps {
  onOpenMuhurthamModal: () => void;
  brokerPhone?: string;
}

export const AuspiciousMuhurthamBanner: React.FC<AuspiciousMuhurthamBannerProps> = ({
  onOpenMuhurthamModal,
  brokerPhone = '+916383040407'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panchangam = getTodayPanchangam();

  const handleWhatsAppInquiry = (slotName: string) => {
    const cleanPhone = brokerPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Namaste, I am on the Sri Varahi Amma Real Estate portal. I would like to consult with you for fixing an Auspicious Muhurtham / Registration timing for a land parcel. Today's date: ${panchangam.dateString}. Please advise on the best Subha Horai.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-[#171513] via-[#241F1A] to-[#171513] text-[#F5F2EB] border-b border-[#D4AF37]/30 shadow-md font-sans">
      
      {/* Top Auspicious Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Left: Today's Panchangam & Subha Muhurtham Highlight */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 px-2.5 py-1 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] font-semibold text-[11px]">
              <Sun className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '18s' }} />
              <span>Today's Subha Horai & Muhurtham</span>
            </div>

            <div className="flex items-center gap-2 text-[#E8E1D5] text-[11px] sm:text-xs">
              <span className="font-serif font-bold text-[#D4AF37]">{panchangam.dayName.split(' ')[0]}:</span>
              <span className="font-medium text-[#FAF8F5]">
                {panchangam.subhaHoraiSlots[0]?.name} ({panchangam.subhaHoraiSlots[0]?.timeWindow})
              </span>
              <span className="hidden lg:inline text-[#665F56]">•</span>
              <span className="hidden lg:inline text-[#B8AEA2]">
                Rahu Kalam: <strong className="text-[#FF8B8B] font-normal">{panchangam.rahuKalam}</strong>
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenMuhurthamModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2A231C] hover:bg-[#3D3328] border border-[#D4AF37]/40 text-[#D4AF37] hover:text-[#FFF] text-[11px] font-medium transition-all shadow-xs cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-[#D4AF37]" />
              <span>Auspicious Dates & Horai</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1D1A17] hover:bg-[#2B2621] text-[#A89F91] hover:text-[#F5F2EB] text-[11px] transition-colors border border-white/5 cursor-pointer"
              title={isExpanded ? 'Collapse daily details' : 'Expand full daily panchangam'}
            >
              <span>{isExpanded ? 'Less' : 'Details'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Daily Panchangam Details Tray */}
      {isExpanded && (
        <div className="bg-[#12100E] border-t border-[#332A22] px-4 sm:px-6 lg:px-8 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* 3-Column Grid for Timing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* Box 1: Subha Horai for Registration & Deeds */}
              <div className="bg-[#1C1814] p-3 rounded-xl border border-[#D4AF37]/30 space-y-1.5">
                <div className="flex items-center justify-between text-[#D4AF37]">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Recommended Registration Horai
                  </span>
                  <span className="text-[10px] bg-[#D4AF37]/20 px-1.5 py-0.5 rounded text-[#D4AF37] font-mono">
                    Subham
                  </span>
                </div>
                <div className="space-y-1">
                  {panchangam.subhaHoraiSlots.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-0.5 border-b border-white/5 last:border-0">
                      <span className="text-[#E0D5C3] font-medium">{slot.name}</span>
                      <span className="text-[#D4AF37] font-mono font-semibold">{slot.timeWindow}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#A89F91] pt-1">
                  Ideal for Sub-Registrar visits, Patta deeds, and token advances.
                </p>
              </div>

              {/* Box 2: Rahu Kalam & Yamagandam (Avoid for Signatures) */}
              <div className="bg-[#1C1814] p-3 rounded-xl border border-[#4A2828] space-y-1.5">
                <div className="flex items-center justify-between text-[#FF8B8B]">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Inauspicious Windows (Avoid)
                  </span>
                  <span className="text-[10px] bg-red-900/40 px-1.5 py-0.5 rounded text-[#FFA8A8] font-mono">
                    Avoid Deeds
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                    <span className="text-[#D1C7BB]">Rahu Kalam:</span>
                    <span className="text-[#FFA8A8] font-mono font-semibold">{panchangam.rahuKalam}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                    <span className="text-[#D1C7BB]">Yamagandam:</span>
                    <span className="text-[#FFA8A8] font-mono font-semibold">{panchangam.yamagandam}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#D1C7BB]">Gulika Kalam:</span>
                    <span className="text-[#D4AF37] font-mono">{panchangam.gulikaKalam}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#8C7A65] pt-1">
                  Avoid paying advances or signing deeds during Rahu Kalam & Yamagandam.
                </p>
              </div>

              {/* Box 3: Daily Tithi, Star & Divine Blessing */}
              <div className="bg-[#1C1814] p-3 rounded-xl border border-[#D4AF37]/30 space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-[#D4AF37]">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sacred Star & Tithi
                  </span>
                  <span className="text-[10px] bg-[#D4AF37]/20 px-1.5 py-0.5 rounded text-[#D4AF37] font-mono">
                    Divine Grace
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                    <span className="text-[#B8AEA2]">Tithi:</span>
                    <span className="text-[#F5F2EB] font-medium">{panchangam.tithi}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-white/5">
                    <span className="text-[#B8AEA2]">Nakshatram:</span>
                    <span className="text-[#D4AF37] font-medium">{panchangam.nakshatra}</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-[#B8AEA2]">Yoga:</span>
                    <span className="text-[#48BB78] font-medium">{panchangam.yoga}</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppInquiry(panchangam.subhaHoraiSlots[0]?.name || 'Subha Horai')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#075E54] hover:bg-[#128C7E] text-white text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Consult on WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
