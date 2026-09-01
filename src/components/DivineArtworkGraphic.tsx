import React from 'react';
import { Sparkles, Key, FileText } from 'lucide-react';
import { DEFAULT_DEITY_PHOTO_URL } from '../data/deityAsset';

interface DivineArtworkGraphicProps {
  className?: string;
  imageUrl?: string;
}

export const DivineArtworkGraphic: React.FC<DivineArtworkGraphicProps> = ({ 
  className = 'w-full h-full',
  imageUrl 
}) => {
  const photo = imageUrl || DEFAULT_DEITY_PHOTO_URL || '/deity.jpg';

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-b from-[#14100C] via-[#1F1914] to-[#0D0A08] flex items-center justify-center ${className}`}>
      
      {/* Background Sacred Ambience Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-r from-[#D4AF37]/20 via-[#FF8C00]/25 to-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#14100C]/60 to-[#0D0A08]" />
      </div>

      {/* Main Artwork Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-3 text-center">
        
        {/* If Photo is available, render photo with divine golden halo frame */}
        {photo ? (
          <img 
            src={photo} 
            alt="Sri Varahi Amma and Lord Ganesha"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              // Graceful fallback to rich devotional card
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}

        {/* Spiritual Devotional Card Fallback (No Cartoons) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#241C15]/90 via-[#1A1410]/95 to-[#120D0A] text-[#F3EAD8]">
          
          {/* Sacred Maha Yantra Halo */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#AA771C] p-0.5 shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#1A1410] flex items-center justify-center">
                <span className="text-3xl text-[#D4AF37] font-serif font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">
                  ॐ
                </span>
              </div>
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-[#FFE58F] animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FFF3D6] tracking-wide mb-1">
            Sri Varahi Amma & Lord Ganesha
          </h3>
          
          <p className="text-xs text-[#D4AF37] font-serif mb-4">
            Divine Guardians of Prosperity, Clear Land Title & Real Estate Wealth
          </p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#2A2119]/80 border border-[#D4AF37]/30 text-left">
              <div className="w-7 h-7 rounded-md bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#FFE8C2]">Lord Ganesha</div>
                <div className="text-[9px] text-[#A89A88]">Land Deed & Clear Patta</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#2A2119]/80 border border-[#E53935]/30 text-left">
              <div className="w-7 h-7 rounded-md bg-[#E53935]/20 flex items-center justify-center text-[#FF8A80] shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#FFCDD2]">Sri Varahi Amma</div>
                <div className="text-[9px] text-[#A89A88]">Golden Property Key</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
