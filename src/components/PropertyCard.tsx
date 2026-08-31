import React, { useState } from 'react';
import { 
  Heart, 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  MessageCircle, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';
import { CurrencyCode, Property, AreaUnit } from '../types';
import { formatPrice } from '../utils/currency';
import { formatLandArea } from '../utils/areaUnits';

interface PropertyCardProps {
  property: Property;
  currency: CurrencyCode;
  areaUnit?: AreaUnit;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
  isCompared: boolean;
  onToggleCompare: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
  onContactAgent: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  areaUnit = 'auto',
  isFavorite,
  onToggleFavorite,
  onSelectProperty,
  onContactAgent,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Direct Land Area format: Cents & Acres for lands/plots
  const landAreaFormatted = formatLandArea(
    property.areaSqFt,
    areaUnit,
    property.region,
    property.propertyType
  );

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleWhatsAppQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = property.agent.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello Harshith, I am interested in visiting "${property.title}" in ${property.locality}, ${property.city} listed for ${formatPrice(property.priceINR, 'INR', property.listingType)}. Please share exact location and title details.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id={`property-card-${property.id}`}
      onClick={() => onSelectProperty(property)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#E5E1DA] hover:border-[#8C7A65] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-0.5 text-[#1A1A1A]"
    >
      {/* Image Gallery Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F4F0EA]">
        <img
          src={property.images[currentImageIndex] || property.images[0]}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between pointer-events-none">
          
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            {/* Patta Verification Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1E7E34] text-[10px] font-sans font-bold border border-[#C3E6CB] shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-[#1E7E34]" />
              <span>Patta Verified</span>
            </span>

            {/* Type */}
            <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold bg-[#1A1A1A]/90 backdrop-blur-md text-white">
              {property.propertyType === 'plot' ? 'Land / Plot' : property.propertyType.toUpperCase()}
            </span>
          </div>

          {/* Top Right: Clean Shortlist / Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            title={isFavorite ? 'Remove from saved' : 'Save property'}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] transition shadow-sm pointer-events-auto"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : 'text-[#8C7A65]'}`} />
          </button>

        </div>

        {/* Carousel Navigation Arrows */}
        {property.images.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button
              type="button"
              onClick={prevImage}
              className="p-1.5 rounded-full bg-white/90 text-[#1A1A1A] hover:bg-white pointer-events-auto shadow-md transition"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="p-1.5 rounded-full bg-white/90 text-[#1A1A1A] hover:bg-white pointer-events-auto shadow-md transition"
              aria-label="Next photo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Image Dots Indicator */}
        {property.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
            {property.images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentImageIndex ? 'w-4 bg-white' : 'w-1 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-2">
          
          {/* Price Tag (Clean INR ₹) */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#1A1816] tracking-tight">
                {formatPrice(property.priceINR, 'INR', property.listingType)}
              </span>
            </div>
            <span className="text-[11px] font-sans font-semibold text-[#8C7A65] bg-[#F4F0EA] px-2.5 py-0.5 rounded-md border border-[#E5E1DA]">
              {property.city}
            </span>
          </div>

          {/* Title & Locality */}
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1A1A] group-hover:text-[#8C7A65] transition-colors line-clamp-1">
              {property.title}
            </h3>
            <p className="text-xs font-sans text-[#736B63] flex items-center gap-1 mt-0.5 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-[#8C7A65] shrink-0" />
              <span>{property.locality}, {property.city}</span>
            </p>
          </div>

          {/* Land / Plot Specific Measurement in Cents / Acres */}
          {property.propertyType === 'plot' ? (
            <div className="bg-[#FAF8F5] border border-[#E5E1DA] rounded-xl p-2.5 space-y-1">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[#736B63] flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-[#8C7A65]" />
                  Land Area:
                </span>
                <span className="font-bold text-[#1A1816] text-sm">
                  {landAreaFormatted.primary}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-sans text-[#8C7A65] pt-1 border-t border-[#EDE8DF]">
                <span>Approach: Tar Road</span>
                <span>Title: Single Owner Patta</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#E5E1DA] text-[#1A1A1A] text-xs font-sans font-medium">
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>{property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Maximize2 className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span className="truncate font-semibold">{landAreaFormatted.primary}</span>
              </div>
            </div>
          )}

        </div>

        {/* Direct Broker Contact CTA Footer */}
        <div className="pt-3 border-t border-[#E5E1DA] flex items-center justify-between gap-2">
          
          {/* Broker Contact */}
          <div className="min-w-0">
            <p className="text-xs font-sans font-bold text-[#1A1816] truncate">Sri Varahi Amma</p>
            <p className="text-[11px] font-sans text-[#736B63] flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#D4AF37]" />
              <span>+91 6383040407</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppQuick}
              title="Chat on WhatsApp"
              className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1E7E34] border border-[#25D366]/30 transition"
            >
              <MessageCircle className="w-4 h-4 text-[#128C7E]" />
            </button>

            {/* Direct Call / Inquire */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContactAgent(property);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#1A1816] hover:bg-black text-white text-xs font-sans font-bold transition shadow-xs flex items-center gap-1"
            >
              <span>Site Visit</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
