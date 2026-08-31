import React from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  ShieldCheck, 
  MessageCircle,
  ExternalLink 
} from 'lucide-react';
import { CurrencyCode, Property } from '../types';
import { formatPrice } from '../utils/currency';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProperties: Property[];
  onRemoveFromCompare: (id: string) => void;
  onClearAll: () => void;
  currency: CurrencyCode;
  onSelectProperty: (property: Property) => void;
  onContactAgent: (property: Property) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedProperties,
  onRemoveFromCompare,
  onClearAll,
  currency,
  onSelectProperty,
  onContactAgent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">Comparative Analysis</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">Property Comparison</h3>
              <p className="text-xs font-sans text-[#736B63]">
                Side-by-side assessment of specifications, valuation, and architectural attributes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProperties.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-sans font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              id="btn-close-compare-modal"
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {comparedProperties.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-[#E5E1DA]">
            <Scale className="w-12 h-12 text-[#8C7A65] mx-auto opacity-50" />
            <p className="text-[#1A1A1A] font-serif text-base font-semibold">No properties selected for comparison.</p>
            <p className="text-xs font-sans text-[#736B63] max-w-sm mx-auto">
              Click the scale/compare icon on any property card to compare features, prices, and locations side-by-side.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse text-xs min-w-[700px] font-sans">
              <thead>
                <tr className="border-b border-[#E5E1DA]">
                  <th className="p-3.5 w-40 text-[#8C7A65] font-bold uppercase text-[10px] tracking-wider">Feature</th>
                  {comparedProperties.map((prop) => (
                    <th key={prop.id} className="p-3.5 min-w-[220px] max-w-[280px]">
                      <div className="relative group">
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-36 object-cover rounded-2xl border border-[#E5E1DA] mb-2.5"
                        />
                        <button
                          onClick={() => onRemoveFromCompare(prop.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-[#736B63] hover:text-rose-600 hover:bg-white shadow transition"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <h4 className="font-serif font-bold text-sm text-[#1A1A1A] line-clamp-1">{prop.title}</h4>
                        <p className="text-[11px] font-sans text-[#736B63] truncate">{prop.city}, {prop.country}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1DA]">
                {/* Price Row */}
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-[#1A1A1A]">Asking Price</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5">
                      <span className="text-base font-serif font-bold text-[#1A1A1A]">
                        {formatPrice(prop.priceINR, currency, prop.listingType)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Location / Market */}
                <tr>
                  <td className="p-3.5 font-semibold text-[#736B63]">Market Region</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E1DA] text-[#1A1A1A] text-[11px] font-medium">
                        {prop.region === 'india' ? '🇮🇳 India' : '🌍 International'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Property Type */}
                <tr className="bg-white">
                  <td className="p-3.5 font-semibold text-[#736B63]">Property Type</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5 capitalize text-[#1A1A1A] font-medium">
                      {prop.propertyType}
                    </td>
                  ))}
                </tr>

                {/* Bedrooms / BHK */}
                <tr>
                  <td className="p-3.5 font-semibold text-[#736B63]">Bedrooms (BHK)</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5 font-bold text-[#1A1A1A]">
                      {prop.bedrooms} Bedrooms
                    </td>
                  ))}
                </tr>

                {/* Bathrooms */}
                <tr className="bg-white">
                  <td className="p-3.5 font-semibold text-[#736B63]">Bathrooms</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5 text-[#1A1A1A]">
                      {prop.bathrooms} Baths
                    </td>
                  ))}
                </tr>

                {/* Area SqFt */}
                <tr>
                  <td className="p-3.5 font-semibold text-[#736B63]">Area (Sq.Ft)</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5 font-bold text-[#8C7A65]">
                      {prop.areaSqFt.toLocaleString()} Sq.Ft
                    </td>
                  ))}
                </tr>

                {/* Price per SqFt */}
                <tr className="bg-white">
                  <td className="p-3.5 font-semibold text-[#736B63]">Rate / Sq.Ft</td>
                  {comparedProperties.map((prop) => {
                    const rateInINR = Math.round(prop.priceINR / (prop.areaSqFt || 1));
                    return (
                      <td key={prop.id} className="p-3.5 text-[#736B63] font-mono">
                        {formatPrice(rateInINR, currency)}/sq.ft
                      </td>
                    );
                  })}
                </tr>

                {/* Furnishing */}
                <tr>
                  <td className="p-3.5 font-semibold text-[#736B63]">Furnishing</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5 text-[#1A1A1A]">
                      {prop.furnishedStatus}
                    </td>
                  ))}
                </tr>

                {/* Legal Verification */}
                <tr className="bg-white">
                  <td className="p-3.5 font-semibold text-[#736B63]">Verification & RERA</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5">
                      <div className="flex items-center gap-1.5 text-[#8C7A65] font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="truncate">{prop.reraId || 'Verified Title'}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Assigned Agent */}
                <tr>
                  <td className="p-3.5 font-semibold text-[#736B63]">Listing Agent</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={prop.agent.photo}
                          alt={prop.agent.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover border border-[#E5E1DA]"
                        />
                        <span className="font-medium text-[#1A1A1A] truncate">{prop.agent.name}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action CTAs */}
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-[#736B63]">Action</td>
                  {comparedProperties.map((prop) => (
                    <td key={prop.id} className="p-3.5 space-y-2">
                      <button
                        onClick={() => {
                          onSelectProperty(prop);
                          onClose();
                        }}
                        className="w-full py-2 rounded-full bg-white hover:bg-[#F4F0EA] text-[#1A1A1A] font-semibold text-xs border border-[#E5E1DA] transition"
                      >
                        View Specifications
                      </button>
                      <button
                        onClick={() => {
                          onContactAgent(prop);
                          onClose();
                        }}
                        className="w-full py-2 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider transition"
                      >
                        Contact Agent
                      </button>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
