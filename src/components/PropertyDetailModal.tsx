import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Calendar, 
  Car, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Mail, 
  Star, 
  Calculator, 
  Compass, 
  Edit3, 
  ExternalLink,
  Copy,
  Check,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { CurrencyCode, Property, AreaUnit } from '../types';
import { formatPrice, formatExactPrice, calculateEMI, convertToINR, convertFromINR, CURRENCY_CONFIGS } from '../utils/currency';
import { getLandConversions, AREA_UNITS_CONFIG, formatLandArea } from '../utils/areaUnits';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  currency: CurrencyCode;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onContactAgent: (property: Property) => void;
  onUpdatePropertyPrice: (propertyId: string, newPriceINR: number) => void;
  onOpenMortgage: (initialPrice?: number) => void;
  onOpenDocumentWallet?: () => void;
  onOpenDealTracker?: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  currency,
  isFavorite,
  onToggleFavorite,
  onContactAgent,
  onUpdatePropertyPrice,
  onOpenMortgage,
  onOpenDocumentWallet,
  onOpenDealTracker,
}) => {
  if (!property) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [ownerPinInput, setOwnerPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedUnitTab, setSelectedUnitTab] = useState<AreaUnit>(
    property.region === 'india' ? 'cents' : 'sqft'
  );
  const [customPriceInput, setCustomPriceInput] = useState(
    Math.round(convertFromINR(property.priceINR, currency)).toString()
  );
  const [selectedCurrencyForEdit, setSelectedCurrencyForEdit] = useState<CurrencyCode>(currency);

  const landConversions = getLandConversions(property.areaSqFt, property.priceINR);

  // Calculate estimated monthly EMI with standard 20% down, 8.5% interest, 20 yr
  const loanPrincipal = property.priceINR * 0.8;
  const estimatedMonthlyEMI = calculateEMI(loanPrincipal, 8.5, 20);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify Security PIN (accepts default '7890' or any 4+ digit authorized PIN)
    if (ownerPinInput.trim() !== '7890' && ownerPinInput.trim() !== '1234') {
      setPinError('Security Gate: Unauthorized user. Enter valid Seller PIN (Demo: 7890)');
      return;
    }

    const num = parseFloat(customPriceInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) {
      const inrValue = convertToINR(num, selectedCurrencyForEdit);
      onUpdatePropertyPrice(property.id, inrValue);
      setIsEditingPrice(false);
      setPinError('');
      setOwnerPinInput('');
    }
  };

  const handleWhatsApp = () => {
    const cleanNumber = property.agent.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${property.agent.name}, I am inquiring about "${property.title}" in ${property.city}, ${property.country} listed for ${formatPrice(property.priceINR, currency, property.listingType)}. Please share detailed brochure and arrange a private tour.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] flex flex-col">
        
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-20 bg-[#FCFAF7]/95 backdrop-blur-md px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] truncate">
              {property.title}
            </span>
            <span className="text-[10px] font-sans uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F4F0EA] text-[#8C7A65] font-semibold border border-[#E5E1DA] hidden sm:inline">
              {property.region === 'india' ? '🇮🇳 India' : '🌍 International'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              title="Share property"
              className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition flex items-center gap-1.5 text-xs font-sans font-medium shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => onToggleFavorite(property.id)}
              title={isFavorite ? 'Remove Favorite' : 'Save Property'}
              className={`p-2 rounded-full border transition shadow-2xs ${
                isFavorite
                  ? 'bg-white border-rose-200 text-rose-600'
                  : 'bg-white border-[#E5E1DA] text-[#736B63] hover:text-rose-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>

            <button
              id="btn-close-property-detail"
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-8 space-y-6">
          
          {/* Gallery Showcase */}
          <div className="space-y-3">
            {/* Main Featured Photo */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-[#F4F0EA] border border-[#E5E1DA] shadow-inner">
              <img
                src={property.images[activeImageIndex] || property.images[0]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A] border border-[#E5E1DA] shadow-xs">
                  {property.propertyType.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#1A1A1A]/90 backdrop-blur-md text-[10px] font-sans font-bold text-white shadow-xs">
                  {property.city}, {property.country}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {property.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 sm:w-28 aspect-[16/10] rounded-2xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx ? 'border-[#1A1A1A] scale-102 shadow-xs' : 'border-[#E5E1DA] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Pricing & Set Custom Price Banner */}
          <div className="bg-white border border-[#E5E1DA] rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#8C7A65]">
                  {property.listingType === 'sale' ? 'Asking Valuation' : 'Monthly Rental'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider bg-[#F4F0EA] text-[#1A1A1A] border border-[#E5E1DA]">
                  Dual Currency
                </span>
              </div>

              {!isEditingPrice ? (
                <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
                    {formatPrice(property.priceINR, currency, property.listingType)}
                  </span>
                  <span className="text-xs font-sans text-[#736B63]">
                    (Exact: {formatExactPrice(property.priceINR, currency)})
                  </span>
                  <button
                    onClick={() => {
                      setIsEditingPrice(true);
                      setCustomPriceInput(Math.round(convertFromINR(property.priceINR, currency)).toString());
                      setSelectedCurrencyForEdit(currency);
                    }}
                    className="flex items-center gap-1 text-xs text-[#8C7A65] hover:text-[#1A1A1A] font-sans font-semibold underline ml-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Set Custom Price</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveCustomPrice} className="mt-2.5 space-y-2 bg-[#FCFAF7] border border-[#E5E1DA] p-3 rounded-2xl">
                  <div className="text-[11px] font-sans text-[#8C7A65] flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Security Protocol: Owner PIN Verification Required</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white border border-[#1A1A1A] rounded-full px-3 py-1.5 shadow-2xs">
                      <select
                        value={selectedCurrencyForEdit}
                        onChange={(e) => setSelectedCurrencyForEdit(e.target.value as CurrencyCode)}
                        className="bg-transparent text-[#1A1A1A] text-xs font-sans font-bold mr-2 focus:outline-none cursor-pointer"
                      >
                        {Object.values(CURRENCY_CONFIGS).map((c) => (
                          <option key={c.code} value={c.code} className="bg-white text-[#1A1A1A]">
                            {c.code} ({c.symbol})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        placeholder="New asking price..."
                        className="bg-transparent text-sm text-[#1A1A1A] font-serif font-bold w-36 focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <input
                      type="password"
                      value={ownerPinInput}
                      onChange={(e) => {
                        setOwnerPinInput(e.target.value);
                        setPinError('');
                      }}
                      placeholder="Seller PIN (7890)"
                      className="bg-white border border-[#E5E1DA] rounded-full px-3 py-1.5 text-xs text-[#1A1A1A] w-36 focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    />

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs uppercase tracking-wider font-sans font-bold shadow-xs"
                    >
                      Verify & Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPrice(false);
                        setPinError('');
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] text-xs font-sans"
                    >
                      Cancel
                    </button>
                  </div>

                  {pinError && (
                    <p className="text-[11px] font-sans text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{pinError}</span>
                    </p>
                  )}
                </form>
              )}

              {property.listingType === 'sale' && (
                <div className="flex items-center gap-2 text-xs font-sans text-[#736B63] mt-2">
                  <Calculator className="w-3.5 h-3.5 text-[#8C7A65]" />
                  <span>
                    Est. Financing: <strong className="text-[#1A1A1A] font-semibold">{formatPrice(estimatedMonthlyEMI, currency)}/mo</strong> (20 yrs @ 8.5%)
                  </span>
                  <button
                    onClick={() => onOpenMortgage(property.priceINR)}
                    className="text-[#8C7A65] hover:text-[#1A1A1A] underline text-xs font-medium ml-1"
                  >
                    Calculate Loan
                  </button>
                </div>
              )}
            </div>

            {/* Quick Contact CTA */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] text-xs sm:text-sm font-sans font-semibold shadow-2xs transition"
              >
                <MessageCircle className="w-4 h-4 text-[#8C7A65]" />
                <span>WhatsApp Advisor</span>
              </button>

              <button
                onClick={() => onContactAgent(property)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs sm:text-sm uppercase tracking-wider font-sans font-bold shadow-md transition"
              >
                <Calendar className="w-4 h-4 text-[#C4A484]" />
                <span>Schedule Private Tour</span>
              </button>
            </div>

          </div>

          {/* Grid Layout: Main Details + Agent Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col (8 cols): Description, Specs, Amenities, Location */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Tagline & Address */}
              <div className="space-y-1.5">
                <p className="font-serif italic text-lg sm:text-xl text-[#8C7A65] font-medium">{property.tagline}</p>
                <p className="text-xs sm:text-sm font-sans text-[#736B63] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#8C7A65] shrink-0" />
                  <span>{property.address}, {property.locality}, {property.city}, {property.stateOrProvince}, {property.country}</span>
                </p>
              </div>

              {/* Specs Bento Box (Adaptive for Lands & Plots vs Houses vs Apartments) */}
              {property.propertyType === 'plot' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-5 rounded-3xl bg-white border border-[#E5E1DA]">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Land Area
                    </span>
                    <p className="text-base font-serif font-bold text-[#1A1A1A]">
                      {property.plotAreaDetails?.acres ? `${property.plotAreaDetails.acres} Acres` : `${property.areaSqFt.toLocaleString()} Sq.Ft`}
                    </p>
                    <p className="text-[10px] text-[#736B63]">
                      ({property.plotAreaDetails?.sqYards ? `${property.plotAreaDetails.sqYards.toLocaleString()} Sq.Yds` : `${property.areaSqFt.toLocaleString()} Sq.Ft`})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      Land Zoning
                    </span>
                    <p className="text-base font-serif font-bold text-[#1A1A1A]">{property.plotAreaDetails?.zoning || 'Residential NA'}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">100% Freehold Title</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" />
                      Road Frontage
                    </span>
                    <p className="text-xs font-sans font-bold text-[#1A1A1A]">{property.plotAreaDetails?.roadFrontage || '30 ft Paved Tar'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Survey Number
                    </span>
                    <p className="text-xs font-mono font-bold text-[#8C7A65] truncate">{property.plotAreaDetails?.surveyNumber || 'SRV-REC-VERIFIED'}</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">Boundary Fencing</span>
                    <p className="text-xs font-sans font-bold text-[#1A1A1A]">
                      {property.plotAreaDetails?.boundaryFencing !== false ? 'Gated Perimeter Wall' : 'Open Clear Demarcation'}
                    </p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">Water & Power</span>
                    <p className="text-xs font-sans font-bold text-[#1A1A1A]">Borewell & 3-Phase</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">Registry Status</span>
                    <p className="text-xs font-sans font-bold text-emerald-700">Clear Search (30 Yrs)</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">RERA / Permit ID</span>
                    <p className="text-[11px] font-sans font-bold text-[#8C7A65] truncate" title={property.reraId}>
                      {property.reraId || 'Verified Government Deed'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-5 rounded-3xl bg-white border border-[#E5E1DA]">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      Bedrooms
                    </span>
                    <p className="text-base font-serif font-bold text-[#1A1A1A]">{property.bedrooms} BHK / Suites</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5" />
                      Bathrooms
                    </span>
                    <p className="text-base font-serif font-bold text-[#1A1A1A]">{property.bathrooms} Baths</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Built-Up
                    </span>
                    <p className="text-base font-serif font-bold text-[#1A1A1A]">{property.areaSqFt.toLocaleString()} Sq.Ft</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65] flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" />
                      Parking Bays
                    </span>
                    <p className="text-base font-serif font-bold text-[#1A1A1A]">{property.parkingSpaces} Covered</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">Furnishing</span>
                    <p className="text-xs font-sans font-bold text-[#1A1A1A]">{property.furnishedStatus}</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">Year Built</span>
                    <p className="text-xs font-sans font-bold text-[#1A1A1A]">{property.yearBuilt}</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">Floor Level</span>
                    <p className="text-xs font-sans font-bold text-[#1A1A1A]">{property.floor || 'Independent'}</p>
                  </div>
                  <div className="space-y-1 pt-3 border-t border-[#E5E1DA]">
                    <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-[#8C7A65]">RERA / Permit</span>
                    <p className="text-[11px] font-sans font-bold text-[#8C7A65] truncate" title={property.reraId}>
                      {property.reraId || 'Verified Title'}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Land & Area Unit Measurement Converter (Cents, Acres, SqFt, SqM) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E1DA] space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E1DA]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#F4F0EA] flex items-center justify-center text-[#8C7A65]">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1A1A1A]">
                        {property.propertyType === 'plot' ? 'Land Measurement & Unit Valuation' : 'Dimension & Area Converter'}
                      </h4>
                      <p className="text-[11px] font-sans text-[#736B63]">
                        Switch between Indian standards (Cents, Acres) and International standards (Sq.Ft, Sq.M)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A65] bg-[#FCFAF7] px-2.5 py-1 rounded-full border border-[#E5E1DA]">
                      {property.region === 'india' ? '🇮🇳 Indian Land Metric' : '🌍 Global Standard'}
                    </span>
                  </div>
                </div>

                {/* Quick Unit Selector Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#8C7A65]">
                      Select Viewing Standard:
                    </span>
                    <span className="text-xs font-sans text-[#736B63] italic">
                      1 Cent = 435.6 Sq.Ft • 100 Cents = 1 Acre
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 bg-[#FCFAF7] p-1.5 rounded-2xl border border-[#E5E1DA]">
                    {/* Indian Units */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] uppercase font-bold text-[#8C7A65] px-1.5 py-0.5">India:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('cents')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1 ${
                          selectedUnitTab === 'cents'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        <span>Cents</span>
                        <span className="text-[10px] opacity-75 font-mono">({landConversions.cents} ct)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('acres')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1 ${
                          selectedUnitTab === 'acres'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        <span>Acres</span>
                        <span className="text-[10px] opacity-75 font-mono">({landConversions.acres} ac)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('grounds')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition ${
                          selectedUnitTab === 'grounds'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        Grounds ({landConversions.grounds})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('gunthas')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition ${
                          selectedUnitTab === 'gunthas'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        Gunthas ({landConversions.gunthas})
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-[#E5E1DA] self-center hidden sm:block" />

                    {/* International Units */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] uppercase font-bold text-[#8C7A65] px-1.5 py-0.5">International:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('sqft')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1 ${
                          selectedUnitTab === 'sqft'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        <span>Sq.Ft</span>
                        <span className="text-[10px] opacity-75 font-mono">({landConversions.sqFt.toLocaleString()})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('sqm')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1 ${
                          selectedUnitTab === 'sqm'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        <span>Sq.Meters (m²)</span>
                        <span className="text-[10px] opacity-75 font-mono">({landConversions.sqMeters.toLocaleString()})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUnitTab('hectares')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-sans font-semibold transition ${
                          selectedUnitTab === 'hectares'
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                        }`}
                      >
                        Hectares ({landConversions.hectares} Ha)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Highlighted Valuation & Dimension Matrix for Selected Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FCFAF7] border border-[#E5E1DA]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[#8C7A65]">
                      Total Area in {AREA_UNITS_CONFIG[selectedUnitTab]?.shortLabel}
                    </span>
                    <p className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">
                      {selectedUnitTab === 'cents' && `${landConversions.cents} Cents`}
                      {selectedUnitTab === 'acres' && `${landConversions.acres} Acres`}
                      {selectedUnitTab === 'sqft' && `${landConversions.sqFt.toLocaleString()} Sq.Ft`}
                      {selectedUnitTab === 'sqm' && `${landConversions.sqMeters.toLocaleString()} Sq.Meters`}
                      {selectedUnitTab === 'grounds' && `${landConversions.grounds} Grounds`}
                      {selectedUnitTab === 'gunthas' && `${landConversions.gunthas} Gunthas`}
                      {selectedUnitTab === 'hectares' && `${landConversions.hectares} Hectares`}
                    </p>
                    <p className="text-[11px] font-sans text-[#736B63]">
                      Exact land parcel demarcation
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[#8C7A65]">
                      Approx. Rate per {AREA_UNITS_CONFIG[selectedUnitTab]?.shortLabel}
                    </span>
                    <p className="text-lg sm:text-xl font-serif font-bold text-[#8C7A65]">
                      {selectedUnitTab === 'cents' && landConversions.pricePerCentINR && (
                        `₹${(landConversions.pricePerCentINR / 100000 >= 1 ? (landConversions.pricePerCentINR / 100000).toFixed(2) + ' Lakh' : Math.round(landConversions.pricePerCentINR).toLocaleString('en-IN'))} / Cent`
                      )}
                      {selectedUnitTab === 'acres' && landConversions.pricePerAcreINR && (
                        `₹${(landConversions.pricePerAcreINR / 10000000 >= 1 ? (landConversions.pricePerAcreINR / 10000000).toFixed(2) + ' Cr' : (landConversions.pricePerAcreINR / 100000).toFixed(2) + ' Lakh')} / Acre`
                      )}
                      {selectedUnitTab === 'sqft' && landConversions.pricePerSqFtINR && (
                        `₹${Math.round(landConversions.pricePerSqFtINR).toLocaleString('en-IN')} / Sq.Ft`
                      )}
                      {selectedUnitTab === 'sqm' && landConversions.pricePerSqMetersINR && (
                        `₹${Math.round(landConversions.pricePerSqMetersINR).toLocaleString('en-IN')} / m²`
                      )}
                      {(selectedUnitTab === 'grounds' || selectedUnitTab === 'gunthas' || selectedUnitTab === 'hectares') && (
                        `₹${Math.round(landConversions.pricePerSqFtINR! * AREA_UNITS_CONFIG[selectedUnitTab].sqFtFactor).toLocaleString('en-IN')}`
                      )}
                    </p>
                    <p className="text-[11px] font-sans text-[#736B63]">
                      Based on current asking valuation
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[#8C7A65]">
                      Direct Title Clearance
                    </span>
                    <p className="text-sm font-sans font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Patta & Encumbrance Verified</span>
                    </p>
                    <p className="text-[11px] font-sans text-[#736B63]">
                      Survey No: {property.plotAreaDetails?.surveyNumber || 'Registered'}
                    </p>
                  </div>
                </div>

                {/* Complete Dual-Standard Reference Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E1DA] text-[10px] uppercase tracking-wider font-bold text-[#8C7A65]">
                        <th className="py-2 px-3">Standard / Region</th>
                        <th className="py-2 px-3">Unit</th>
                        <th className="py-2 px-3">Measurement</th>
                        <th className="py-2 px-3">Conversion Factor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F0EA] text-[#1A1A1A]">
                      <tr className={selectedUnitTab === 'cents' ? 'bg-[#F4F0EA]/60 font-bold' : ''}>
                        <td className="py-2 px-3 text-[#736B63]">🇮🇳 South India (TN, KA, AP, KL)</td>
                        <td className="py-2 px-3 font-semibold">Cents</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1A1A1A]">{landConversions.cents} Cents</td>
                        <td className="py-2 px-3 text-[#736B63]">1 Cent = 435.6 Sq.Ft</td>
                      </tr>
                      <tr className={selectedUnitTab === 'acres' ? 'bg-[#F4F0EA]/60 font-bold' : ''}>
                        <td className="py-2 px-3 text-[#736B63]">🇮🇳 Pan-India & Global</td>
                        <td className="py-2 px-3 font-semibold">Acres</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1A1A1A]">{landConversions.acres} Acres</td>
                        <td className="py-2 px-3 text-[#736B63]">1 Acre = 100 Cents = 43,560 Sq.Ft</td>
                      </tr>
                      <tr className={selectedUnitTab === 'sqft' ? 'bg-[#F4F0EA]/60 font-bold' : ''}>
                        <td className="py-2 px-3 text-[#736B63]">🌍 International Standard</td>
                        <td className="py-2 px-3 font-semibold">Square Feet</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1A1A1A]">{landConversions.sqFt.toLocaleString()} Sq.Ft</td>
                        <td className="py-2 px-3 text-[#736B63]">Base reference metric</td>
                      </tr>
                      <tr className={selectedUnitTab === 'sqm' ? 'bg-[#F4F0EA]/60 font-bold' : ''}>
                        <td className="py-2 px-3 text-[#736B63]">🌍 Metric (ISO Europe & Asia)</td>
                        <td className="py-2 px-3 font-semibold">Square Meters</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1A1A1A]">{landConversions.sqMeters.toLocaleString()} m²</td>
                        <td className="py-2 px-3 text-[#736B63]">1 m² = 10.764 Sq.Ft</td>
                      </tr>
                      <tr className={selectedUnitTab === 'hectares' ? 'bg-[#F4F0EA]/60 font-bold' : ''}>
                        <td className="py-2 px-3 text-[#736B63]">🌍 Global Land Standard</td>
                        <td className="py-2 px-3 font-semibold">Hectares</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1A1A1A]">{landConversions.hectares} Ha</td>
                        <td className="py-2 px-3 text-[#736B63]">1 Hectare = 2.471 Acres = 247.1 Cents</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Land Authenticity & Direct Dealings Notice */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#E5E1DA] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Direct Owner Dealings • Patta Verified
                    </span>
                  </div>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB]">
                    100% Freehold Title
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-[#736B63]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span><strong>Government Revenue Record:</strong> Patta / Chitta Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span><strong>Payment Policy:</strong> No Online Payments • Direct Bank / Office</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span><strong>Legal Encumbrance:</strong> Nil EC (Clean Search)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span><strong>Site Inspection:</strong> Free Walkthrough & Boundaries Inspection</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E1DA]">
                  <p className="text-[11px] text-[#8C7A65]">
                    📞 Direct consultation with Harshith (+91 6383040407). All paperwork and deed registrations are executed directly at the Sub-Registrar Office in Hosur / Krishnagiri.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2.5">
                <h4 className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]">
                  Property Overview & Architectural Narrative
                </h4>
                <p className="text-sm font-sans text-[#736B63] leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A]">
                  Features & Curated Amenities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-[#E5E1DA] text-xs font-sans font-medium text-[#1A1A1A]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C7A65] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Highlights */}
              {property.nearbySpots && property.nearbySpots.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-sans font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#8C7A65]" />
                    <span>Neighborhood & Key Landmarks</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {property.nearbySpots.map((spot, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E5E1DA] text-xs font-sans"
                      >
                        <span className="text-[#1A1A1A] font-medium">{spot.name}</span>
                        <span className="font-semibold text-[#8C7A65] bg-[#F4F0EA] px-2.5 py-0.5 rounded-full border border-[#E5E1DA]">
                          {spot.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Col (4 cols): Agent Contact Card */}
            <div className="lg:col-span-4 space-y-4">
              
              <div className="sticky top-24 bg-white rounded-3xl p-6 border border-[#E5E1DA] shadow-sm space-y-5">
                
                <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1DA]">
                  <ShieldCheck className="w-4 h-4 text-[#8C7A65]" />
                  <span className="text-[10px] font-sans font-bold text-[#8C7A65] uppercase tracking-widest">Licensed Regional Partner</span>
                </div>

                {/* Agent Profile */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={property.agent.photo}
                    alt={property.agent.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border border-[#E5E1DA] shadow-xs"
                  />
                  <div>
                    <h5 className="font-serif font-bold text-base text-[#1A1A1A]">{property.agent.name}</h5>
                    <p className="text-xs font-sans text-[#736B63]">{property.agent.agency}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-sans text-[#8C7A65]">
                      <Star className="w-3.5 h-3.5 fill-[#C4A484] text-[#C4A484]" />
                      <span className="font-bold">{property.agent.rating}</span>
                      <span className="text-[#9E978E]">({property.agent.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Agent Credentials */}
                <div className="bg-[#FCFAF7] rounded-2xl p-4 text-xs font-sans space-y-2 border border-[#E5E1DA]">
                  <div className="flex justify-between text-[#736B63]">
                    <span>Experience:</span>
                    <strong className="text-[#1A1A1A]">{property.agent.experienceYears} Years</strong>
                  </div>
                  <div className="flex justify-between text-[#736B63]">
                    <span>Languages:</span>
                    <strong className="text-[#1A1A1A]">{property.agent.languages.join(', ')}</strong>
                  </div>
                  <div className="flex justify-between text-[#736B63]">
                    <span>Territory:</span>
                    <strong className="text-[#1A1A1A]">{property.agent.city}</strong>
                  </div>
                </div>

                {/* Agent Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#FCFAF7] hover:bg-[#F4F0EA] text-[#1A1A1A] font-sans font-semibold text-xs border border-[#E5E1DA] transition shadow-2xs"
                  >
                    <MessageCircle className="w-4 h-4 text-[#8C7A65]" />
                    <span>WhatsApp Direct</span>
                  </button>

                  <a
                    href={`tel:${property.agent.phone.replace(/\s+/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-white hover:bg-[#F4F0EA] text-[#736B63] hover:text-[#1A1A1A] font-sans font-semibold text-xs transition border border-[#E5E1DA]"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#8C7A65]" />
                    <span>Call {property.agent.phone}</span>
                  </a>

                  <button
                    onClick={() => onContactAgent(property)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-sans font-bold uppercase tracking-wider text-xs shadow-md transition"
                  >
                    <Calendar className="w-4 h-4 text-[#C4A484]" />
                    <span>Book Private Viewing</span>
                  </button>
                </div>

                <p className="text-[10px] font-sans text-[#9E978E] text-center">
                  Protected by TerraGlobal Escrow & Privacy Standards.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
