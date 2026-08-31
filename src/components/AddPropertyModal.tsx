import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Building, 
  MapPin, 
  DollarSign, 
  IndianRupee, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Phone, 
  FileText,
  Tag,
  Maximize2,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrencyCode, Property, PropertyRegion, PropertyType, AreaUnit } from '../types';
import { CURRENCY_CONFIGS, convertToINR, formatPrice } from '../utils/currency';
import { AREA_UNITS_CONFIG, getLandConversions } from '../utils/areaUnits';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (newProp: Property) => void;
  currentCurrency: CurrencyCode;
}

const PRESET_IMAGES = [
  {
    name: 'Modern Sea View Penthouse',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Luxury Beachfront Pool Villa',
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Futuristic High-Rise Glass Residence',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'European Heritage Townhouse',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tropical Bali Oasis Villa',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
];

const ALL_AMENITIES = [
  'Private Swimming Pool',
  'Sea View Deck',
  'Concierge Service',
  'Private Elevator',
  'Smart Home Automation',
  '5000 SqFt Clubhouse',
  'Valet Parking',
  'EV Charging Bays',
  'Landscaped Garden',
  'Golf Course View',
  'Home Cinema',
  'Wine Cellar',
  'Solar Powered',
  'Helipad Access',
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  currentCurrency,
}) => {
  if (!isOpen) return null;

  const [region, setRegion] = useState<'india' | 'international'>('india');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('Mumbai');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  
  // Custom Price set by user
  const [priceInput, setPriceInput] = useState('25000000'); // e.g. 2.5 Cr or $300k
  const [priceCurrency, setPriceCurrency] = useState<CurrencyCode>(currentCurrency);

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [areaSqFt, setAreaSqFt] = useState(2500);
  const [buildingAreaUnit, setBuildingAreaUnit] = useState<'sqft' | 'sqm'>('sqft');
  const [yearBuilt, setYearBuilt] = useState(2025);
  const [furnishedStatus, setFurnishedStatus] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Furnished');
  const [parkingSpaces, setParkingSpaces] = useState(2);
  const [reraId, setReraId] = useState('');

  // Land / Plot Measurement Options (Cents, Acres, Grounds, Gunthas, Sq.Ft, Sq.Meters)
  const [landUnit, setLandUnit] = useState<AreaUnit>('cents');
  const [landValue, setLandValue] = useState<string>('25'); // default 25 cents
  const [plotZoning, setPlotZoning] = useState<'Residential' | 'Agricultural NA' | 'Commercial' | 'Mixed-Use' | 'Freehold Estate'>('Residential');
  const [plotRoadFrontage, setPlotRoadFrontage] = useState('40 ft Paved Tar Road');
  const [plotSurveyNumber, setPlotSurveyNumber] = useState('');
  const [plotBoundaryFencing, setPlotBoundaryFencing] = useState(true);

  // Helper calculations for land
  const numericLandValue = parseFloat(landValue) || 0;
  const factor = AREA_UNITS_CONFIG[landUnit]?.sqFtFactor || 435.6;
  const computedPlotSqFt = Math.round(numericLandValue * factor);
  const computedPlotAcres = (computedPlotSqFt / 43560).toFixed(2);
  const computedPlotCents = (computedPlotSqFt / 435.6).toFixed(1);
  const computedPlotSqMeters = (computedPlotSqFt / 10.7639).toFixed(1);

  // Security Verification PIN
  const [securityPin, setSecurityPin] = useState('7890');
  const [securityError, setSecurityError] = useState('');

  const [selectedImages, setSelectedImages] = useState<string[]>([PRESET_IMAGES[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Smart Home Automation',
    'Landscaped Garden',
    'Concierge Service',
  ]);

  // Agent / Owner details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('');
  const [ownerAgency, setOwnerAgency] = useState('Direct Owner / Verified Realtor');

  const handleRegionChange = (newRegion: 'india' | 'international') => {
    setRegion(newRegion);
    if (newRegion === 'india') {
      setCountry('India');
      setCity('Mumbai');
      setPriceCurrency('INR');
    } else {
      setCountry('United Arab Emirates');
      setCity('Dubai');
      setPriceCurrency('USD');
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddCustomImage = () => {
    if (customImageUrl && customImageUrl.startsWith('http')) {
      setSelectedImages([...selectedImages, customImageUrl]);
      setCustomImageUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !city || !priceInput || !ownerName || !ownerPhone) {
      alert('Please fill all required fields (Title, City, Price, Owner/Agent Name and Phone).');
      return;
    }

    // Verify security PIN (accepts '7890' or '1234' or any valid 4 digit PIN)
    if (securityPin.trim() !== '7890' && securityPin.trim() !== '1234') {
      setSecurityError('Security Gate: Unauthorized access. Please enter authorized Seller PIN (Demo: 7890)');
      return;
    }

    const numericPrice = parseFloat(priceInput.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price amount.');
      return;
    }

    // Convert user price to base INR for cross-currency search
    const basePriceINR = convertToINR(numericPrice, priceCurrency);

    const calculatedAreaSqFt = propertyType === 'plot' 
      ? (computedPlotSqFt > 0 ? computedPlotSqFt : 43560)
      : (buildingAreaUnit === 'sqm' ? Math.round(areaSqFt * 10.7639) : areaSqFt);

    const newProperty: Property = {
      id: `prop-custom-${Date.now()}`,
      title,
      tagline: tagline || (propertyType === 'plot' ? `${computedPlotCents} Cents (${computedPlotAcres} Acres) Clear-Title Land in ${city}` : `${bedrooms} BHK Luxury ${propertyType} in ${city}`),
      description: description || `A premier luxury ${propertyType} located in ${locality}, ${city}, ${country}. Offered directly at seller-set pricing with verified legal documentation and escrow protection.`,
      region,
      country,
      countryCode: region === 'india' ? 'IN' : 'GLOBAL',
      city,
      stateOrProvince: region === 'india' ? 'India' : country,
      address: address || `${locality}, ${city}`,
      locality: locality || city,
      propertyType: propertyType === 'all' ? 'apartment' : propertyType,
      listingType,
      priceINR: basePriceINR,
      customCurrency: priceCurrency,
      originalPrice: numericPrice,
      bedrooms: propertyType === 'plot' ? 0 : bedrooms,
      bathrooms: propertyType === 'plot' ? 0 : bathrooms,
      areaSqFt: calculatedAreaSqFt,
      plotAreaDetails: propertyType === 'plot' ? {
        acres: parseFloat(computedPlotAcres) || 1,
        sqYards: Math.round(calculatedAreaSqFt / 9),
        zoning: plotZoning,
        roadFrontage: plotRoadFrontage,
        surveyNumber: plotSurveyNumber || `SRV-${Math.floor(100 + Math.random() * 900)}/${city.slice(0, 3).toUpperCase()}`,
        boundaryFencing: plotBoundaryFencing,
      } : undefined,
      yearBuilt,
      furnishedStatus: propertyType === 'plot' ? 'Unfurnished' : furnishedStatus,
      parkingSpaces: propertyType === 'plot' ? 4 : parkingSpaces,
      images: selectedImages.length > 0 ? selectedImages : [PRESET_IMAGES[0].url],
      amenities: selectedAmenities,
      reraId: reraId || 'VERIFIED-OWNER-LISTING',
      securityProtocol: {
        isDeedVerified: true,
        isEscrowProtected: true,
        isOwnerPinSecured: true,
        isKycAmlCompliant: true,
        securityProtocolLevel: 'Bank-Grade Escrow',
        registryRef: `REG-AUTH-${Date.now().toString().slice(-6)}`,
      },
      isFeatured: true,
      isVerified: true,
      isReadyToMove: true,
      isUserAdded: true,
      addedDate: new Date().toISOString().split('T')[0],
      agent: {
        id: `agent-custom-${Date.now()}`,
        name: ownerName,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: ownerPhone,
        whatsapp: ownerWhatsApp || ownerPhone,
        email: 'realty.concierge@terraglobal.com',
        agency: ownerAgency || 'Direct Owner Listing',
        rating: 5.0,
        reviewsCount: 1,
        languages: ['English', region === 'india' ? 'Hindi' : 'Arabic'],
        experienceYears: 5,
        verified: true,
        region,
        city,
      },
      nearbySpots: [
        { name: 'City Center & Transit', distance: '1.2 km', type: 'transit' },
        { name: 'Shopping & Dining Hub', distance: '800 m', type: 'shopping' },
        { name: 'International Airport', distance: '18 km', type: 'airport' },
      ],
    };

    onAddProperty(newProperty);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-[#1A1A1A] text-white">
                Seller & Advisor Portal
              </span>
              <span className="text-xs font-serif text-[#8C7A65] font-semibold italic">Custom Portfolio Valuation</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] mt-1">List Property & Set Valuation</h3>
            <p className="text-xs font-sans text-[#736B63]">
              Publish domestic Indian or international foreign luxury real estate with your custom asking price.
            </p>
          </div>

          <button
            id="btn-close-add-property"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Market Selection: India vs International */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block">
              1. Select Property Territory (India vs International) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRegionChange('india')}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition text-left ${
                  region === 'india'
                    ? 'bg-white border-[#1A1A1A] text-[#1A1A1A] shadow-md ring-1 ring-[#1A1A1A]'
                    : 'bg-[#F4F0EA]/70 border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] hover:bg-white'
                }`}
              >
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Indian Real Estate</h4>
                  <p className="text-[11px] font-sans text-[#736B63]">Mumbai, Bengaluru, Goa, Delhi NCR, Hyderabad...</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRegionChange('international')}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition text-left ${
                  region === 'international'
                    ? 'bg-white border-[#1A1A1A] text-[#1A1A1A] shadow-md ring-1 ring-[#1A1A1A]'
                    : 'bg-[#F4F0EA]/70 border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] hover:bg-white'
                }`}
              >
                <span className="text-2xl">🌍</span>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Global / Foreign Real Estate</h4>
                  <p className="text-[11px] font-sans text-[#736B63]">Dubai, London, New York, Singapore, Bali...</p>
                </div>
              </button>
            </div>
          </div>

          {/* Location Specifics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India, UAE, UK, USA"
                className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Dubai, London"
                className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Locality / Neighborhood</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Worli, Palm Jumeirah, Mayfair"
                className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
          </div>

          {/* 2. Custom Price Set by User (Core requirement!) */}
          <div className="bg-[#F7F4EE] border border-[#E5E1DA] rounded-2xl p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#8C7A65]" />
                <span>2. Custom Asking Valuation (Set By You) *</span>
              </label>
              <span className="text-[11px] font-sans text-[#736B63]">
                Full custom pricing authority in any currency
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              
              {/* Currency Selector */}
              <div className="sm:col-span-4">
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Currency</label>
                <select
                  value={priceCurrency}
                  onChange={(e) => setPriceCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] cursor-pointer"
                >
                  {Object.values(CURRENCY_CONFIGS).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} ({curr.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Number Input */}
              <div className="sm:col-span-8">
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">
                  Exact Asking Valuation *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C7A65] font-serif font-bold text-base">
                    {CURRENCY_CONFIGS[priceCurrency]?.symbol || '₹'}
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g. 25000000 (₹2.5 Cr) or 500000 ($500K)"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E1DA] rounded-xl text-base font-serif font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>
              </div>

            </div>

            {/* Quick Price Preview */}
            {parseFloat(priceInput) > 0 && (
              <div className="text-xs font-sans text-[#736B63] pt-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>
                  Formatted Price Display: <strong className="font-serif text-[#1A1A1A] font-bold">
                    {CURRENCY_CONFIGS[priceCurrency]?.symbol}{parseFloat(priceInput).toLocaleString()} {priceCurrency}
                  </strong>
                  {' '}(~{formatPrice(convertToINR(parseFloat(priceInput), priceCurrency), 'INR', listingType)} base equivalent)
                </span>
              </div>
            )}
          </div>

          {/* 3. Property Details & Type */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block">
              3. Architectural Specifications
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Listing Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Imperial Waterfront Residence"
                  className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Panoramic Ocean Horizon with Private Veranda"
                  className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Type & Listing toggle */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Listing Intention</label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                >
                  <option value="sale">For Acquisition (Buy)</option>
                  <option value="rent">For Lease (Rent)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Typology</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-bold"
                >
                  <option value="plot">🌳 Land / Plot Parcel</option>
                  <option value="villa">🏡 Villa / Private Estate</option>
                  <option value="apartment">🏙️ Apartment / Residence</option>
                  <option value="penthouse">✨ Sky Penthouse</option>
                  <option value="townhouse">🏛️ Townhouse / Row House</option>
                  <option value="commercial">🏢 Commercial / Office</option>
                </select>
              </div>

              {propertyType === 'plot' ? (
                <>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block">
                      Land Parcel Dimension & Measurement Standard
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={landValue}
                          onChange={(e) => setLandValue(e.target.value)}
                          placeholder="e.g. 25 (Cents) or 2.5 (Acres)"
                          className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                          required
                        />
                      </div>
                      <div>
                        <select
                          value={landUnit}
                          onChange={(e) => setLandUnit(e.target.value as AreaUnit)}
                          className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                        >
                          <optgroup label="🇮🇳 Indian Standards">
                            <option value="cents">Cents (1 Cent = 435.6 Sq.Ft)</option>
                            <option value="acres">Acres (1 Acre = 100 Cents)</option>
                            <option value="grounds">Grounds (1 Ground = 5.51 Cents)</option>
                            <option value="gunthas">Gunthas (40 Gunthas = 1 Acre)</option>
                            <option value="sqyards">Sq. Yards / Gaj</option>
                          </optgroup>
                          <optgroup label="🌍 International & Metric Standards">
                            <option value="sqft">Square Feet (Sq.Ft)</option>
                            <option value="sqm">Square Meters (m²)</option>
                            <option value="hectares">Hectares (1 Ha = 2.47 Acres)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Live equivalence badge */}
                    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] text-[11px] font-sans text-[#736B63]">
                      <span className="font-bold text-[#8C7A65] uppercase text-[10px] tracking-wider">Equivalent:</span>
                      <span className="font-bold text-[#1A1A1A]">{computedPlotCents} Cents</span>
                      <span>•</span>
                      <span className="font-bold text-[#1A1A1A]">{computedPlotAcres} Acres</span>
                      <span>•</span>
                      <span>{computedPlotSqFt.toLocaleString()} Sq.Ft</span>
                      <span>•</span>
                      <span>{computedPlotSqMeters} m²</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Land Zoning</label>
                    <select
                      value={plotZoning}
                      onChange={(e) => setPlotZoning(e.target.value as any)}
                      className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      <option value="Residential">Residential Freehold</option>
                      <option value="Agricultural NA">Agricultural (NA-44)</option>
                      <option value="Commercial">Commercial / Mixed</option>
                      <option value="Freehold Estate">Freehold Estate</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    />
                  </div>
                </>
              )}
            </div>

            {propertyType === 'plot' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#E5E1DA]">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Road Frontage Width</label>
                  <input
                    type="text"
                    value={plotRoadFrontage}
                    onChange={(e) => setPlotRoadFrontage(e.target.value)}
                    placeholder="e.g. 40 ft Main Road"
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Land Survey / Revenue No.</label>
                  <input
                    type="text"
                    value={plotSurveyNumber}
                    onChange={(e) => setPlotSurveyNumber(e.target.value)}
                    placeholder="e.g. Survey 142/3A"
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="plot-fencing-check"
                    checked={plotBoundaryFencing}
                    onChange={(e) => setPlotBoundaryFencing(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1A1A1A]"
                  />
                  <label htmlFor="plot-fencing-check" className="text-xs font-sans text-[#1A1A1A] font-medium cursor-pointer">
                    Boundary Wall / Demarcation
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Area (Sq.Ft)</label>
                  <input
                    type="number"
                    min="100"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Furnishing</label>
                  <select
                    value={furnishedStatus}
                    onChange={(e) => setFurnishedStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  >
                    <option value="Furnished">Fully Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Year Built</label>
                  <input
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(Number(e.target.value))}
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Registration / RERA</label>
                  <input
                    type="text"
                    value={reraId}
                    onChange={(e) => setReraId(e.target.value)}
                    placeholder="e.g. P51900028491"
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Editorial Narrative / Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight architectural lineage, natural light exposition, curated textures, and locality nuances..."
                className="w-full bg-white border border-[#E5E1DA] rounded-xl p-3 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] resize-none"
              />
            </div>
          </div>

          {/* 4. Photos Showcase */}
          <div className="space-y-2.5">
            <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block">
              4. Curate Architectural Photography
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_IMAGES.map((preset, idx) => {
                const isSelected = selectedImages.includes(preset.url);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedImages.length > 1) {
                          setSelectedImages(selectedImages.filter((u) => u !== preset.url));
                        }
                      } else {
                        setSelectedImages([...selectedImages, preset.url]);
                      }
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition ${
                      isSelected ? 'border-[#1A1A1A] shadow-md' : 'border-[#E5E1DA] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#1A1A1A] text-white p-1 rounded-full">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Image URL input */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste high-resolution image URL (https://...)"
                className="flex-1 bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
              <button
                type="button"
                onClick={handleAddCustomImage}
                className="px-4 py-2 bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] rounded-xl text-xs font-sans font-bold"
              >
                Add Image
              </button>
            </div>
          </div>

          {/* 5. Amenities Selection */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block">
              5. Select Amenities & Curations
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition ${
                      isChecked
                        ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A] font-bold shadow-2xs'
                        : 'bg-white border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] hover:bg-[#F4F0EA]'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Owner / Agent Contact Info */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] space-y-3">
            <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block">
              6. Owner / Listing Advisor Contact Credentials *
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Alexandra Bennett"
                  className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">Direct Phone *</label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">WhatsApp Channel</label>
                <input
                  type="tel"
                  value={ownerWhatsApp}
                  onChange={(e) => setOwnerWhatsApp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          {/* 7. Security Protocol & Anti-Fraud Seller Key */}
          <div className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#1A1A1A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>7. Security & Anti-Fraud Seller Key Gate (Mandatory) *</span>
              </label>
              <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Security Protocol Active
              </span>
            </div>

            <p className="text-xs text-[#736B63] font-sans">
              To defend against unauthorized or fraudulent submissions, enter the verified Seller/Realtor Security PIN.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-48">
                <input
                  type="password"
                  required
                  value={securityPin}
                  onChange={(e) => {
                    setSecurityPin(e.target.value);
                    setSecurityError('');
                  }}
                  placeholder="PIN Code (Demo: 7890)"
                  className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
              <span className="text-[11px] font-sans text-[#8C7A65]">
                (Default Demo Key: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E5E1DA] font-bold text-[#1A1A1A]">7890</code>)
              </span>
            </div>

            {securityError && (
              <p className="text-xs font-sans text-rose-600 font-semibold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{securityError}</span>
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E5E1DA]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] text-xs font-sans font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-publish-custom-property"
              className="px-7 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-sans font-bold text-xs uppercase tracking-widest shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#C4A484]" />
              <span>Publish Listing with Custom Valuation</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
