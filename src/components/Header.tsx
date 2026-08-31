import React from 'react';
import { 
  Building2, 
  Heart, 
  User, 
  Phone,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserAccount, PropertyRegion } from '../types';
import { DEFAULT_DEITY_PHOTO_URL } from '../data/deityAsset';

interface HeaderProps {
  currentRegion: PropertyRegion;
  onRegionChange: (region: PropertyRegion) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenAddProperty: () => void;
  currentUser: UserAccount;
  onOpenAuthModal: () => void;
  onOpenProfile?: () => void;
  customLogoUrl?: string;
  onOpenDarshan?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  onOpenFavorites,
  currentUser,
  onOpenAuthModal,
  customLogoUrl,
  onOpenDarshan,
}) => {
  const effectiveLogo = customLogoUrl || '';
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/98 to-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E6E0D5] text-[#1A1A1A] transition-all shadow-[0_4px_24px_-10px_rgba(26,24,22,0.08)]">
      
      {/* Luxury Gold & Deep Bronze Top Accent Ribbon */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#1A1816] via-[#D4AF37] to-[#1A1816]" />

      {/* Top Advisory Contact Bar */}
      <div className="bg-[#171513] text-[#E8E4DC] text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-[#282420]">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[#D4AF37] font-serif tracking-wider font-semibold">
            Sri Varahi Amma Real Estate
          </span>
          <span className="hidden sm:inline text-[#665F56]">•</span>
          <span className="hidden sm:inline text-[#A89E92] font-sans">
            Hosur, Krishnagiri & Bangalore Border
          </span>
        </div>

        <div className="flex items-center text-[11px] sm:text-xs font-sans">
          <a 
            href="tel:+916383040407" 
            className="flex items-center gap-1.5 text-[#EDE8DF] hover:text-[#D4AF37] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-bold tracking-wide">+91 6383040407</span>
          </a>
        </div>
      </div>

      {/* Main Single-Row Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name with Regal Ornamental Details */}
        <div 
          onClick={onOpenDarshan}
          className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 cursor-pointer group"
          title="Click to view Divine Darshan & Blessings"
        >
          
          {/* Logo Frame with Deity Icon */}
          <div className="relative group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#2A2520] via-[#1A1816] to-[#0F0E0D] p-0.5 shadow-md ring-2 ring-[#D4AF37]/50 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              {effectiveLogo ? (
                <img
                  src={effectiveLogo}
                  alt="Sri Varahi Amma Real Estate"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-[#1A1816] flex items-center justify-center text-[#D4AF37]">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] animate-pulse" />
                </div>
              )}
            </div>
            {/* Subtle Gold Status Ring */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#FAF7F2] shadow-xs" />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            {/* Main Brand Title with Ornamental Serif Styling */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-xl font-extrabold tracking-wide uppercase font-serif text-[#171513] drop-shadow-2xs group-hover:text-[#8C7A65] transition-colors">
                Sri Varahi Amma
              </span>
              <span className="text-xs sm:text-base font-serif font-bold uppercase tracking-widest text-[#8C7A65]">
                Real Estate
              </span>
            </div>
            
            {/* Brand Subtitle / Seal */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#786F64] font-sans font-medium tracking-wide">
              <span className="hidden sm:inline">Direct Land Deals</span>
              <span className="hidden sm:inline text-[#C4BCB0]">•</span>
              <span className="inline-flex items-center gap-0.5 text-[#2E7D32] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Patta Certified
              </span>
            </div>
          </div>
        </div>

        {/* Clean Right Controls (Shortlist & Sign In with Refined Styling) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Divine Blessing / Darshan Button */}
          {onOpenDarshan && (
            <button
              onClick={onOpenDarshan}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF0E6] hover:bg-[#F5E5D3] border border-[#D4AF37]/50 text-xs font-serif font-bold text-[#8C5E1E] transition shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Divine Darshan</span>
            </button>
          )}
          
          {/* Saved Shortlist / Favorites */}
          <button
            id="btn-open-favorites"
            onClick={onOpenFavorites}
            className="relative p-2 sm:p-2.5 rounded-full bg-white hover:bg-[#F3EFE8] border border-[#E3DDD1] text-[#1A1A1A] transition shadow-xs flex items-center gap-1.5 px-3 sm:px-4 group"
            title="Saved Shortlisted Properties"
          >
            <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${favoritesCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-[#8C7A65]'}`} />
            <span className="text-xs font-semibold hidden sm:inline text-[#1A1A1A]">Shortlist</span>
            {favoritesCount > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#1A1816] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* User Sign In / Account */}
          <button
            id="btn-user-account"
            onClick={onOpenAuthModal}
            title="Account / Broker Access"
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full border border-[#E3DDD1] bg-white hover:bg-[#F3EFE8] text-xs font-sans font-semibold text-[#1A1A1A] transition shadow-xs"
          >
            <User className="w-4 h-4 text-[#8C7A65]" />
            <span className="text-xs font-bold">{currentUser.isLoggedIn ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
          </button>

        </div>

      </div>
    </header>
  );
};
