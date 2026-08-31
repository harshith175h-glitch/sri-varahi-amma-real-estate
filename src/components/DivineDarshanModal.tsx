import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  FileText, 
  Key, 
  MessageSquare,
  Sun
} from 'lucide-react';
import { DivineArtworkGraphic } from './DivineArtworkGraphic';
import { getDeityImage } from '../utils/imageStorage';

interface DivineDarshanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplorePlots: () => void;
  customDeityImageUrl?: string;
}

export const DivineDarshanModal: React.FC<DivineDarshanModalProps> = ({
  isOpen,
  onClose,
  onExplorePlots,
  customDeityImageUrl,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return customDeityImageUrl || localStorage.getItem('varahi_custom_deity_art') || '';
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (customDeityImageUrl) {
      setImgSrc(customDeityImageUrl);
      setHasError(false);
    } else {
      getDeityImage().then((stored) => {
        if (isMounted && stored) {
          setImgSrc(stored);
          setHasError(false);
        }
      });
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      if (!isMounted) return;
      if (customEvent.detail) {
        setImgSrc(customEvent.detail);
        setHasError(false);
      }
    };

    window.addEventListener('deity-image-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('deity-image-updated', handleUpdate);
    };
  }, [customDeityImageUrl]);

  const handleImageError = () => {
    setHasError(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto font-sans animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#1E1914] via-[#15120F] to-[#0D0B09] text-[#F5F2EB] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/60 my-auto relative">
        
        {/* Top Gold Arch Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#D4AF37]" />

        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#382E24] bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2A231C] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Sun className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                Divine Blessing & Auspicious Entrance
              </h2>
              <p className="text-[11px] text-[#D4AF37] font-sans">
                Sri Varahi Amma & Lord Ganesha • Divine Guardians of Real Estate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A89E92] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sacred Altar Canvas */}
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Main Visual Altar Frame */}
          <div 
            className="relative rounded-2xl p-1.5 bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#996515] shadow-[0_0_45px_rgba(212,175,55,0.35)] overflow-hidden"
          >
            <div className="rounded-[14px] bg-[#120F0D] overflow-hidden relative group">
              
              {/* Deity Image Render */}
              <div className="relative aspect-16/9 w-full bg-black overflow-hidden flex items-center justify-center">
                {!hasError && imgSrc ? (
                  <img 
                    src={imgSrc} 
                    alt="Sri Varahi Amma & Lord Ganesha Divine Darshan" 
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DivineArtworkGraphic className="w-full h-full" />
                )}
              </div>

              {/* Bottom Caption */}
              <div className="bg-[#171310] p-3 text-center border-t border-[#332A22] space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
                  ॥ श्री महागणपतये नमः • श्री वराही देव्यै नमः ॥
                </span>
                <p className="text-xs text-[#E5DACE] font-serif">
                  Lord Ganesha (Holder of the Land Deed) & Goddess Sri Varahi Amma (Keeper of the Golden Key)
                </p>
              </div>

            </div>
          </div>

          {/* Meaning Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Lord Ganesha Card */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-[#D4AF37]/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#FFE8C2]">Lord Ganesha</h4>
                  <span className="text-[10px] text-[#D4AF37] font-medium">Land Deed & Clear Patta</span>
                </div>
              </div>
              <p className="text-[11px] text-[#B8AA99] leading-relaxed">
                Removes all boundary doubts, title disputes, and delays in registration.
              </p>
            </div>

            {/* Goddess Sri Varahi Amma Card */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-[#E53935]/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E53935]/20 border border-[#E53935] flex items-center justify-center text-[#FF8A80]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#FFCDD2]">Goddess Sri Varahi Amma</h4>
                  <span className="text-[10px] text-[#FF8A80] font-medium">Golden Property Key</span>
                </div>
              </div>
              <p className="text-[11px] text-[#B8AA99] leading-relaxed">
                Protects the soil, increases land value, and blesses buyers with perpetual wealth.
              </p>
            </div>

          </div>

          {/* Akhanda Deepam */}
          <div className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#FFA500] py-1">
            <Flame className="w-4 h-4 text-[#FFA500] animate-pulse" />
            <span>Akhanda Deepam • Light of Prosperity & Auspiciousness in Hosur</span>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="https://wa.me/916383040407?text=Namaste%20Harshith%2C%20I%20seek%20auspicious%20guidance%20for%20purchasing%20land%2Fplot%20in%20Hosur."
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-[#1E7E34] hover:bg-[#19692C] text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect on WhatsApp (+91 6383040407)</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onExplorePlots();
              }}
              className="py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-[#171513] text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#171513]" />
              <span>Explore Verified Plots & Lands</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-black/60 border-t border-[#332A22] text-center text-[10px] text-[#8C7A65]">
          Direct Owner Real Estate Desk • Hosur, Krishnagiri & Bangalore Border
        </div>

      </div>
    </div>
  );
};
