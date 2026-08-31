import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Sun, 
  Sparkles, 
  FileCheck, 
  CheckCircle2, 
  ShieldAlert, 
  MessageSquare,
  Compass,
  Key,
  Flame,
  ChevronRight
} from 'lucide-react';
import { getTodayPanchangam, getUpcomingAuspiciousDates, AuspiciousDateItem } from '../utils/panchangam';

interface MuhurthamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerPhone?: string;
}

export const MuhurthamDetailsModal: React.FC<MuhurthamDetailsModalProps> = ({
  isOpen,
  onClose,
  brokerPhone = '+916383040407'
}) => {
  const [selectedTab, setSelectedTab] = useState<'today' | 'upcoming' | 'vastu'>('today');
  const panchangam = getTodayPanchangam();
  const upcomingDates = getUpcomingAuspiciousDates();

  if (!isOpen) return null;

  const handleWhatsAppConsult = (subject: string) => {
    const cleanPhone = brokerPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Namaste, I am reviewing the Auspicious Muhurtham section on Sri Varahi Amma Real Estate. I would like to consult with you about: "${subject}". Please advise on the best timing.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-[#181512] text-[#F5F2EB] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 my-auto relative flex flex-col max-h-[90vh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#2A231C] via-[#1E1914] to-[#2A231C] px-5 py-4 border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FFF3B0] flex items-center justify-center text-[#1A1816] shadow-md">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  Vedic Panchangam & Horai
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#FAF8F5]">
                Auspicious Muhurtham for Land & Property
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#2A241F] hover:bg-[#3D3328] text-[#C4B7A6] hover:text-[#FFF] flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#12100E] px-5 py-2.5 border-b border-[#2C241D] flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedTab('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedTab === 'today'
                ? 'bg-[#D4AF37] text-[#171513] shadow-md font-bold'
                : 'bg-[#221C16] text-[#B8AEA2] hover:text-[#FFF]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Horai Timings</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedTab === 'upcoming'
                ? 'bg-[#D4AF37] text-[#171513] shadow-md font-bold'
                : 'bg-[#221C16] text-[#B8AEA2] hover:text-[#FFF]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming Registration Muhurthams</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('vastu')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedTab === 'vastu'
                ? 'bg-[#D4AF37] text-[#171513] shadow-md font-bold'
                : 'bg-[#221C16] text-[#B8AEA2] hover:text-[#FFF]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vastu & Plot Guidelines</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
          
          {/* TAB 1: TODAY'S PANCHANGAM */}
          {selectedTab === 'today' && (
            <div className="space-y-6">
              
              {/* Sacred Blessing Notice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#241E18] to-[#1A1612] border border-[#D4AF37]/30 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#D4AF37]">
                    ॥ श्री वरप्रदायिनी वराही अनुग्रहम् ॥
                  </h4>
                  <p className="text-xs text-[#E0D5C3] mt-1 leading-relaxed">
                    {panchangam.propertyBlessingNote}
                  </p>
                </div>
              </div>

              {/* Today's Planetary Windows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Golden Subha Horai Card */}
                <div className="p-4 rounded-2xl bg-[#1D1814] border border-[#D4AF37]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-serif uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                      <Sun className="w-4 h-4" />
                      Auspicious Subha Horai Today
                    </span>
                    <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] font-mono px-2 py-0.5 rounded font-semibold">
                      Deeds & Advance
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {panchangam.subhaHoraiSlots.map((slot, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#28211B] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#FAF8F5] text-xs">{slot.name}</span>
                          <span className="font-mono text-[#D4AF37] font-bold text-xs">{slot.timeWindow}</span>
                        </div>
                        <p className="text-[11px] text-[#A89F91]">{slot.significance}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {slot.recommendedFor.map((item, idx) => (
                            <span key={idx} className="text-[9px] bg-[#171411] text-[#E0D5C3] px-1.5 py-0.5 rounded border border-white/5">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inauspicious Periods & Celestial Coordinates Card */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1D1814] border border-[#522929] space-y-3">
                    <div className="flex items-center justify-between text-[#FFA8A8]">
                      <span className="text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        Inauspicious Windows (Do Not Sign)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#2B1B1B]">
                        <span className="text-[#E0CFCF]">Rahu Kalam:</span>
                        <span className="font-mono font-bold text-[#FF8B8B]">{panchangam.rahuKalam}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#2B1B1B]">
                        <span className="text-[#E0CFCF]">Yamagandam:</span>
                        <span className="font-mono font-bold text-[#FF8B8B]">{panchangam.yamagandam}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#1F1914]">
                        <span className="text-[#D1C7BB]">Gulika Kalam:</span>
                        <span className="font-mono text-[#D4AF37]">{panchangam.gulikaKalam}</span>
                      </div>
                    </div>
                  </div>

                  {/* Celestial Coordinates */}
                  <div className="p-4 rounded-2xl bg-[#1D1814] border border-[#332A22] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#D4AF37] font-semibold">
                      <span>Daily Vedic Coordinates</span>
                      <span className="text-[10px] font-mono text-[#A89F91]">{panchangam.dateString}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-[#241E18] p-2 rounded-lg">
                        <span className="text-[#8C7A65] block text-[10px]">Tithi</span>
                        <span className="text-[#FAF8F5] font-medium">{panchangam.tithi}</span>
                      </div>
                      <div className="bg-[#241E18] p-2 rounded-lg">
                        <span className="text-[#8C7A65] block text-[10px]">Nakshatra</span>
                        <span className="text-[#D4AF37] font-medium">{panchangam.nakshatra}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: UPCOMING SUBHA MUHURTHAMS */}
          {selectedTab === 'upcoming' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-serif font-bold text-[#D4AF37]">
                  Upcoming Subha Muhurtham Dates for Real Estate
                </h4>
                <span className="text-xs text-[#A89F91]">
                  Verified for Sub-Registrar Offices & Bhumi Pooja
                </span>
              </div>

              <div className="space-y-3">
                {upcomingDates.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#1E1914] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#FAF8F5] font-serif">{item.date} ({item.day})</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          item.auspiciousness === 'Golden Muhurtham'
                            ? 'bg-[#D4AF37] text-[#171513]'
                            : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] bg-[#2E251E] text-[#C4B7A6] px-1.5 py-0.5 rounded">
                          {item.timing}
                        </span>
                      </div>
                      <p className="text-xs text-[#E0D5C3]">
                        {item.bestFor}
                      </p>
                      <p className="text-[10px] text-[#A89F91]">
                        Nakshatram: <strong className="text-[#D4AF37] font-normal">{item.nakshatra}</strong> • Tithi: {item.tithi}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppConsult(`Book Subha Muhurtham on ${item.date} for ${item.type}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Book Timing</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VASTU & PLOT SELECTION */}
          {selectedTab === 'vastu' && (
            <div className="space-y-4">
              <h4 className="text-sm font-serif font-bold text-[#D4AF37]">
                Sacred Vastu & Plot Direction Guidance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                <div className="p-3.5 rounded-xl bg-[#1E1914] border border-[#D4AF37]/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>East & North Facing Plots (Ishanya / Kubera)</span>
                  </div>
                  <p className="text-xs text-[#E0D5C3] leading-relaxed">
                    Supreme for financial accumulation and peace of mind. Bring direct morning sunlight and uninterrupted prosperity for residential villas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E1914] border border-[#D4AF37]/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Square & Rectangular Geometry (Shubha Akara)</span>
                  </div>
                  <p className="text-xs text-[#E0D5C3] leading-relaxed">
                    Plots with length-to-breadth ratio below 1:2 and 90-degree corners offer harmonious energy flow and zero structural waste during construction.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E1914] border border-[#D4AF37]/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Clear Patta & Direct Road Access (Veethi Shula Safe)</span>
                  </div>
                  <p className="text-xs text-[#E0D5C3] leading-relaxed">
                    All listed plots on Sri Varahi Amma Real Estate have surveyed approach roads (30ft/40ft wide) ensuring effortless vehicle entry and positive frontage.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E1914] border border-[#D4AF37]/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Borewell & Water Source Point (North-East)</span>
                  </div>
                  <p className="text-xs text-[#E0D5C3] leading-relaxed">
                    Groundwater drilling in the Ishanya quadrant invites abundant perennial sweet water and continuous blessing from Mother Earth (Bhumidevi).
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer with Direct Action */}
        <div className="bg-[#12100E] px-5 py-3.5 border-t border-[#2C241D] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-[#B8AEA2]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sri Varahi Amma Real Estate • 100% Clear Titles & Sacred Timing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#241E18] hover:bg-[#332B22] text-[#C4B7A6] hover:text-[#FFF] text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleWhatsAppConsult("Auspicious Registration & Muhurtham Schedule")}
              className="px-4 py-2 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Auspicious Consultation</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
