import React from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  MessageCircle, 
  ExternalLink 
} from 'lucide-react';
import { CurrencyCode, Property } from '../types';
import { formatPrice } from '../utils/currency';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteProperties: Property[];
  onRemoveFavorite: (id: string) => void;
  onClearFavorites: () => void;
  currency: CurrencyCode;
  onSelectProperty: (property: Property) => void;
  onContactAgent: (property: Property) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favoriteProperties,
  onRemoveFavorite,
  onClearFavorites,
  currency,
  onSelectProperty,
  onContactAgent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 backdrop-blur-xs flex justify-end">
      <div className="relative bg-[#FCFAF7] border-l border-[#E5E1DA] w-full max-w-md h-full shadow-2xl text-[#1A1A1A] flex flex-col justify-between">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#8C7A65] fill-[#8C7A65]" />
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">Private Portfolio</span>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">Saved Properties ({favoriteProperties.length})</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {favoriteProperties.length > 0 && (
              <button
                onClick={onClearFavorites}
                className="p-2 rounded-full bg-white hover:bg-rose-50 border border-[#E5E1DA] text-[#736B63] hover:text-rose-600 transition"
                title="Clear all favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Property List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 font-sans">
          {favoriteProperties.length === 0 ? (
            <div className="text-center py-20 space-y-3 bg-white rounded-2xl border border-[#E5E1DA]">
              <Heart className="w-12 h-12 text-[#8C7A65] mx-auto opacity-40" />
              <p className="text-[#1A1A1A] font-serif text-base font-semibold">No saved properties yet.</p>
              <p className="text-xs text-[#736B63] max-w-xs mx-auto">
                Tap the heart icon on any Indian or foreign listing to save it to your private portfolio.
              </p>
            </div>
          ) : (
            favoriteProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white border border-[#E5E1DA] rounded-2xl p-3.5 shadow-2xs flex gap-3.5 relative group hover:border-[#8C7A65] transition"
              >
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 object-cover rounded-xl shrink-0 cursor-pointer border border-[#E5E1DA]"
                  onClick={() => {
                    onSelectProperty(prop);
                    onClose();
                  }}
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        onClick={() => {
                          onSelectProperty(prop);
                          onClose();
                        }}
                        className="font-serif font-bold text-xs sm:text-sm text-[#1A1A1A] hover:text-[#8C7A65] cursor-pointer truncate"
                      >
                        {prop.title}
                      </h4>
                      <button
                        onClick={() => onRemoveFavorite(prop.id)}
                        className="text-[#736B63] hover:text-rose-600 p-0.5"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#736B63] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[#8C7A65] shrink-0" />
                      <span>{prop.locality}, {prop.city}</span>
                    </p>

                    <div className="text-xs font-serif font-bold text-[#1A1A1A] mt-1">
                      {formatPrice(prop.priceINR, currency, prop.listingType)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      onClick={() => {
                        onSelectProperty(prop);
                        onClose();
                      }}
                      className="flex-1 py-1.5 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[11px] font-semibold text-[#1A1A1A] transition"
                    >
                      Specs
                    </button>
                    <button
                      onClick={() => {
                        onContactAgent(prop);
                        onClose();
                      }}
                      className="py-1.5 px-3 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] font-bold uppercase tracking-wider transition"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E1DA] bg-white">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-sans font-bold uppercase tracking-wider transition"
          >
            Continue Browsing
          </button>
        </div>

      </div>
    </div>
  );
};
