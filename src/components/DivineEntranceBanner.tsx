import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Key, 
  ShieldCheck, 
  MessageSquare,
  Maximize2,
  Heart,
  Sun
} from 'lucide-react';
import { DivineArtworkGraphic } from './DivineArtworkGraphic';
import { getDeityImage } from '../utils/imageStorage';

interface DivineEntranceBannerProps {
  onOpenDarshan: () => void;
  onExplorePlots: () => void;
  customDeityImageUrl?: string;
}

export const DivineEntranceBanner: React.FC<DivineEntranceBannerProps> = ({
  onOpenDarshan,
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

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#171513] via-[#1E1B17] to-[#141210] text-[#F5F2EB] border-b-2 border-[#D4AF37]/40 shadow-xl font-sans">
      
      {/* Decorative Golden Arch / Celestial Star Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-gradient-to-b from-[#D4AF37] via-[#FFA500]/30 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Sacred Artwork Presentation */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div 
              className="group relative rounded-3xl overflow-hidden p-1.5 bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#AA771C] shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(212,175,55,0.55)] w-full max-w-[560px]"
            >
              <div className="relative rounded-[22px] overflow-hidden bg-[#1A1816]">
                {/* Visual Image Render */}
                <div 
                  onClick={onOpenDarshan}
                  className="relative aspect-16/9 sm:aspect-16/10 w-full overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                >
                  {!hasError && imgSrc && !imgSrc.includes('fallback') ? (
                    <img 
                      src={imgSrc} 
                      alt="Sri Varahi Amma & Lord Ganesha Blessing" 
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <DivineArtworkGraphic className="w-full h-full" />
                  )}

                  {/* Corner Fullscreen Badge */}
                  <div className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xs border border-[#D4AF37]/60 text-[11px] text-[#D4AF37] font-serif font-bold flex items-center gap-1 shadow-md pointer-events-none">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Darshan</span>
                  </div>
                </div>

                {/* Bottom Card Ribbon with Divine Title */}
                <div className="bg-[#12100E] px-4 py-2.5 text-center border-t border-[#332A22] flex items-center justify-between">
                  <span className="text-[11px] font-serif font-bold text-[#E0D5C3] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span>Lord Ganesha & Sri Varahi Amma</span>
                  </span>
                  
                  <span className="text-[10px] font-mono text-[#D4AF37] font-semibold bg-[#241F1A] px-2.5 py-1 rounded-md border border-[#D4AF37]/30">
                    100% Auspicious Blessings
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Emotional Welcome Message & Devotional Tone */}
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
            
            {/* Auspicious Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2A231C] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-sans font-bold shadow-xs">
              <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Divine Grace • 100% Clear Patta & Prosperity</span>
            </div>

            {/* Main Sacred Greeting */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#FFF8ED] leading-tight drop-shadow-sm">
              Welcome to <span className="text-[#D4AF37]">Sri Varahi Amma</span> Real Estate
            </h2>

            {/* Emotional Devotional Paragraph */}
            <p className="text-xs sm:text-sm text-[#D1C7B8] font-sans leading-relaxed">
              May <strong className="text-white">Lord Ganesha</strong> remove every obstacle and bless you with crystal-clear <strong>Land Deeds</strong>, and may <strong className="text-[#D4AF37]">Goddess Sri Varahi Amma</strong> place the sacred <strong>Golden Property Key</strong> of endless wealth and family peace into your hands.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-[#211D18] border border-[#3A332B] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="text-[11px] text-[#E0D7CC] font-medium">100% Single-Owner Patta</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#211D18] border border-[#3A332B] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="text-[11px] text-[#E0D7CC] font-medium">Direct Owner Handover</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#211D18] border border-[#3A332B] flex items-center gap-2 col-span-2 sm:col-span-1">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-[11px] text-[#E0D7CC] font-medium">Hosur & Krishnagiri Border</span>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onOpenDarshan}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-[#171513] text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#171513]" />
                <span>Open Divine Darshan</span>
              </button>

              <a
                href="https://wa.me/916383040407?text=Hello%20Harshith%2C%20I%20visited%20Sri%20Varahi%20Amma%20Real%20Estate%20website%20and%20would%20like%20to%20inquire%20about%20blessed%20lands%20and%20plots."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#1E7E34] hover:bg-[#19692C] text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-2 hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Harshith (+91 6383040407)</span>
              </a>

              <button
                onClick={onExplorePlots}
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 border border-[#D4AF37]/50 text-[#F5F2EB] text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Explore Properties ↓
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
