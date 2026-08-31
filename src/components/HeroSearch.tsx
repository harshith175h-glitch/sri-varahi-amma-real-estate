import React from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { FilterState } from '../types';

interface HeroSearchProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  onToggleFiltersModal: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  filters,
  onUpdateFilter,
}) => {
  return (
    <div className="relative bg-[#FAF7F2] text-[#1A1A1A] pt-8 sm:pt-12 pb-10 sm:pb-14 px-3 sm:px-6 lg:px-8 border-b border-[#E6E0D5]">
      
      {/* Background Soft Ambient Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-gradient-to-b from-[#D4AF37]/25 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
        
        {/* Verification Guarantee Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E3DDD1] text-[#8C7A65] text-[11px] sm:text-xs font-sans font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Single-Owner Patta & Verified Land Records</span>
        </div>

        {/* Premium Display Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif font-black tracking-tight text-[#171513] leading-[1.15] max-w-3xl mx-auto drop-shadow-2xs">
          Prime Lands, Residential Plots & Homes in Hosur
        </h1>
        
        <p className="text-xs sm:text-base text-[#736B63] max-w-2xl mx-auto font-sans leading-relaxed px-2 font-normal">
          Direct owner properties with clear titles, verified survey records, and transparent pricing across Bagalur Road, Thally Valley, Sipcot, and Krishnagiri.
        </p>

        {/* Search Bar Container */}
        <div className="mt-5 sm:mt-7 bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E3DDD1] shadow-md text-left max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 w-full flex-1 border-b sm:border-b-0 sm:border-r border-[#E8E2D8]">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C7A65] shrink-0" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => onUpdateFilter('query', e.target.value)}
                placeholder="Search by area (e.g. Bagalur Road, Thally, Sipcot)..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder-[#8C7A65]"
              />
            </div>

            {/* Quick Property Type Filter */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto px-1 py-0.5">
              <button
                type="button"
                onClick={() => onUpdateFilter('propertyType', 'all')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition ${
                  filters.propertyType === 'all'
                    ? 'bg-[#1A1816] text-white shadow-xs'
                    : 'bg-[#F3EFE8] text-[#736B63] hover:bg-[#E8E2D8]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onUpdateFilter('propertyType', 'plot')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition ${
                  filters.propertyType === 'plot'
                    ? 'bg-[#1A1816] text-white shadow-xs'
                    : 'bg-[#F3EFE8] text-[#736B63] hover:bg-[#E8E2D8]'
                }`}
              >
                Lands & Plots
              </button>
              <button
                type="button"
                onClick={() => onUpdateFilter('propertyType', 'villa')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition ${
                  filters.propertyType === 'villa'
                    ? 'bg-[#1A1816] text-white shadow-xs'
                    : 'bg-[#F3EFE8] text-[#736B63] hover:bg-[#E8E2D8]'
                }`}
              >
                Houses
              </button>
            </div>

          </div>
        </div>

        {/* Popular Hosur Areas */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs text-[#8C7A65]">
          <span className="flex items-center gap-1 font-semibold text-[11px] sm:text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#8C7A65]" />
            Key Areas:
          </span>
          {['Bagalur Road', 'Thally Valley', 'Sipcot Phase 2', 'Attibele Border', 'Krishnagiri'].map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => onUpdateFilter('query', area)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E3DDD1] text-[#1A1A1A] hover:border-[#1A1A1A] transition text-[11px] sm:text-xs font-medium shadow-2xs"
            >
              {area}
            </button>
          ))}
        </div>

        {/* Clean Assurance Seal */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E3DDD1] text-xs font-medium text-[#1A1A1A] shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#1E7E34]" />
            <span>Single-Owner Patta Certified & Direct Seller Deals</span>
          </div>
        </div>

      </div>
    </div>
  );
};
