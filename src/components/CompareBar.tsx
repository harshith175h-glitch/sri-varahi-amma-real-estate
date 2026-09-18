import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';

interface CompareBarProps {
  comparedProperties: { id: string; title: string; city: string }[];
  onOpenCompare: () => void;
  onRemove: (propertyId: string) => void;
  onClearAll: () => void;
}

/**
 * Sticky compare tray.
 *
 * Previously the ComparisonModal existed but nothing ever opened it
 * (`setIsCompareOpen(true)` was never called) and PropertyCard ignored the
 * `isCompared` / `onToggleCompare` props it received — the whole comparison
 * feature was unreachable. This tray plus the compare toggle on each card make
 * it usable on both desktop and mobile.
 */
export const CompareBar: React.FC<CompareBarProps> = ({
  comparedProperties,
  onOpenCompare,
  onRemove,
  onClearAll,
}) => {
  if (comparedProperties.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#171513] text-[#FAF8F5] border-t border-[#D4AF37]/40 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.6)]"
      role="region"
      aria-label="Property comparison tray"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Scale className="w-4 h-4 text-[#D4AF37] shrink-0" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] shrink-0">
            Compare ({comparedProperties.length}/4)
          </span>
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
            {comparedProperties.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] whitespace-nowrap"
              >
                <span className="max-w-[180px] truncate">{p.title}</span>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  aria-label={`Remove ${p.title} from comparison`}
                  className="text-[#B8AEA2] hover:text-white transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#B8AEA2] hover:text-white transition"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#c19f2e] text-[#171513] text-xs font-bold transition shadow-xs"
          >
            <span>Compare side by side</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
