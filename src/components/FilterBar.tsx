import React from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  CheckCircle2, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { CurrencyCode, FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  currency: CurrencyCode;
  totalMatches: number;
  isOpenModal: boolean;
  onCloseModal: () => void;
  onOpenSecurityProtocol?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  totalMatches,
}) => {
  return (
    <div className="bg-white border-b border-[#E5E1DA] py-3.5 px-4 sm:px-6 lg:px-8 sticky top-20 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left Side: Property Type & Budget Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C7A65]" />
            <span>Filter:</span>
          </div>

          {/* Property Type Dropdown */}
          <select
            value={filters.propertyType}
            onChange={(e) => onUpdateFilter('propertyType', e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E1DA] bg-[#FCFAF7] text-[#1A1A1A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          >
            <option value="all">All Properties</option>
            <option value="plot">Lands & Plots (Cents/Acres)</option>
            <option value="villa">Houses & Villas</option>
          </select>

          {/* Budget Range */}
          <select
            value={filters.maxPrice}
            onChange={(e) => onUpdateFilter('maxPrice', Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E1DA] bg-[#FCFAF7] text-[#1A1A1A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          >
            <option value={1500000000}>Budget: Any Price</option>
            <option value={3000000}>Under ₹30 Lakhs</option>
            <option value={5000000}>Under ₹50 Lakhs</option>
            <option value={10000000}>Under ₹1 Crore</option>
            <option value={20000000}>Under ₹2 Crores</option>
            <option value={50000000}>Under ₹5 Crores</option>
          </select>

          {/* Patta Verified Only Filter */}
          <button
            type="button"
            onClick={() => onUpdateFilter('verifiedOnly', !filters.verifiedOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              filters.verifiedOnly
                ? 'bg-[#EBF7EE] text-[#1E7E34] border-[#C3E6CB]'
                : 'bg-[#FCFAF7] text-[#736B63] border-[#E5E1DA] hover:bg-[#F4F0EA]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Patta Verified Only</span>
          </button>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8C7A65] hover:text-[#1A1A1A] transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Right Side: Total Matching Results */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-sans">
          <span className="text-[#736B63]">
            Available Properties: <strong className="text-[#1A1A1A] font-bold">{totalMatches}</strong>
          </span>
        </div>

      </div>
    </div>
  );
};
