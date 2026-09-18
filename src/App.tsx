import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Plus, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  SlidersHorizontal, 
  RotateCcw,
  IndianRupee,
  Phone,
  MessageCircle,
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  Building,
  Languages,
  HelpCircle,
  Calculator,
  Scale,
  UserCheck,
  FileText,
  User
} from 'lucide-react';
import { 
  CurrencyCode, 
  FilterState, 
  InquirySubmission, 
  Property, 
  PropertyRegion, 
  PropertyType, 
  ListingType,
  CommunicationProfile,
  UserAccount,
  InquirySubmitResult
} from './types';
import { INITIAL_PROPERTIES } from './data/mockProperties';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { FilterBar } from './components/FilterBar';
import { PropertyCard } from './components/PropertyCard';
import { ContactAgentModal } from './components/ContactAgentModal';
import { SecurityBanner } from './components/SecurityBanner';
import { BrokerContactConfig, DEFAULT_BROKER_CONFIG } from './data/brokerDefaults';
import { lazyModal } from './utils/lazyModal';
import { DivineEntranceBanner } from './components/DivineEntranceBanner';
import { AuspiciousMuhurthamBanner } from './components/AuspiciousMuhurthamBanner';
import { ToastContainer, ToastMessage } from './components/Toast';
import { getDeityImage } from './utils/imageStorage';
import { DEFAULT_DEITY_PHOTO_URL } from './data/deityAsset';
import { readJSON, readString, writeJSON, writeString } from './utils/storage';
import {
  submitInquiry,
  fetchProperties,
  createProperty,
  updateProperty,
  uploadImage,
} from './utils/api';
import { CompareBar } from './components/CompareBar';

// Heavy, on-demand dialogs are code-split (see utils/lazyModal.tsx).
const PropertyDetailModal = lazyModal(() => import('./components/PropertyDetailModal'), 'PropertyDetailModal');
const AddPropertyModal = lazyModal(() => import('./components/AddPropertyModal'), 'AddPropertyModal');
const MortgageCalculatorModal = lazyModal(() => import('./components/MortgageCalculatorModal'), 'MortgageCalculatorModal');
const ComparisonModal = lazyModal(() => import('./components/ComparisonModal'), 'ComparisonModal');
const AgentDirectoryModal = lazyModal(() => import('./components/AgentDirectoryModal'), 'AgentDirectoryModal');
const FavoritesDrawer = lazyModal(() => import('./components/FavoritesDrawer'), 'FavoritesDrawer');
const CommunicationProfileModal = lazyModal(() => import('./components/CommunicationProfileModal'), 'CommunicationProfileModal');
const PlatformGuideModal = lazyModal(() => import('./components/PlatformGuideModal'), 'PlatformGuideModal');
const AuthAndUserAccountModal = lazyModal(() => import('./components/AuthAndUserAccountModal'), 'AuthAndUserAccountModal');
const DocumentWalletModal = lazyModal(() => import('./components/DocumentWalletModal'), 'DocumentWalletModal');
const DealEscrowTrackerModal = lazyModal(() => import('./components/DealEscrowTrackerModal'), 'DealEscrowTrackerModal');
const PrivacyPolicyModal = lazyModal(() => import('./components/PrivacyPolicyModal'), 'PrivacyPolicyModal');
const BrokerContactSettingsModal = lazyModal(() => import('./components/BrokerContactSettingsModal'), 'BrokerContactSettingsModal');
const SecurityProtocolModal = lazyModal(() => import('./components/SecurityProtocolModal'), 'SecurityProtocolModal');
const DivineDarshanModal = lazyModal(() => import('./components/DivineDarshanModal'), 'DivineDarshanModal');
const MuhurthamDetailsModal = lazyModal(() => import('./components/MuhurthamDetailsModal'), 'MuhurthamDetailsModal');
const OwnerDeskModal = lazyModal(() => import('./components/OwnerDeskModal'), 'OwnerDeskModal');
const DEFAULT_FILTERS: FilterState = {
  query: '',
  region: 'all',
  country: '',
  city: '',
  listingType: 'all',
  propertyType: 'all',
  minPrice: 0,
  maxPrice: 1500000000, // ₹150 Cr upper bound
  bedrooms: 'all',
  bathrooms: 'all',
  verifiedOnly: false,
  readyToMoveOnly: false,
  amenities: [],
  sortBy: 'featured',
  areaUnit: 'auto',
  landScaleFilter: 'all',
};

const DEFAULT_COMMUNICATION_PROFILE: CommunicationProfile = {
  name: '',
  email: '',
  phone: '',
  primaryLanguage: 'English',
  spokenLanguages: ['English', 'Tamil', 'Kannada', 'Telugu', 'Hindi'],
  preferredChannel: 'whatsapp',
  preferredTimeSlot: 'morning',
  investorType: 'luxury_buyer',
  serviceModePreference: 'offline_in_person',
  notes: 'Interested in verified lands and homes in Hosur / Krishnagiri.',
};

const DEFAULT_USER_ACCOUNT: UserAccount = {
  id: 'guest-buyer',
  name: 'Guest Buyer',
  email: '',
  phone: '',
  role: 'buyer',
  isLoggedIn: false,
  kycStatus: 'Pending',
  preferredLanguage: 'English',
  preferredServiceMode: 'offline_in_person',
  walletBalanceINR: 0,
  escrowLockedINR: 0,
  memberSince: '2026',
};

export default function App() {
  // --- Persistent State ---
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = readJSON<Property[]>('properties', []);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_PROPERTIES;
  });

  // NOTE: the shortlist intentionally starts empty. The previous build seeded
  // two fake favourites on every new browser, which made the counter lie.
  const [favorites, setFavorites] = useState<string[]>(() =>
    readJSON<string[]>('favorites', [])
  );

  const [comparedIds, setComparedIds] = useState<string[]>(() =>
    readJSON<string[]>('compare', [])
  );

  const [currency, setCurrency] = useState<CurrencyCode>(
    () => (readString('currency', 'INR') as CurrencyCode) || 'INR'
  );

  const [communicationProfile, setCommunicationProfile] = useState<CommunicationProfile>(() =>
    readJSON<CommunicationProfile>('commProfile', DEFAULT_COMMUNICATION_PROFILE)
  );

  const [currentUser, setCurrentUser] = useState<UserAccount>(() =>
    readJSON<UserAccount>('userAccount', DEFAULT_USER_ACCOUNT)
  );

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // --- Modals State ---
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [contactProperty, setContactProperty] = useState<Property | null>(null);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isMortgageOpen, setIsMortgageOpen] = useState(false);
  const [mortgageInitialPrice, setMortgageInitialPrice] = useState<number | undefined>(undefined);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAgentsOpen, setIsAgentsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDocumentWalletOpen, setIsDocumentWalletOpen] = useState(false);
  const [isDealTrackerOpen, setIsDealTrackerOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isBrokerSettingsOpen, setIsBrokerSettingsOpen] = useState(false);
  const [isSecurityProtocolOpen, setIsSecurityProtocolOpen] = useState(false);
  const [isDarshanOpen, setIsDarshanOpen] = useState(false);
  const [isMuhurthamOpen, setIsMuhurthamOpen] = useState(false);
  const [isOwnerDeskOpen, setIsOwnerDeskOpen] = useState(false);
  /** Ids of listings that live on the server (editable/deletable from the owner desk). */
  const [serverPropertyIds, setServerPropertyIds] = useState<string[]>([]);

  // --- Broker Contact & Business Settings State ---
  const [brokerConfig, setBrokerConfig] = useState<BrokerContactConfig>(() => {
    const parsed = readJSON<Partial<BrokerContactConfig>>('brokerConfig', {});
    return {
      ...DEFAULT_BROKER_CONFIG,
      ...parsed,
      deityImageUrl: parsed?.deityImageUrl || undefined,
    };
  });

  // Load listings published from the owner desk. These are stored on the server
  // (data/properties.json) and shown to every visitor; the bundled demo
  // catalogue is only merged in behind them.
  useEffect(() => {
    let isMounted = true;
    fetchProperties()
      .then((res) => {
        if (!isMounted || !res.ok || !res.data?.properties) return;
        const incoming = res.data.properties as unknown as Property[];
        if (incoming.length === 0) return;
        setServerPropertyIds(incoming.map((p) => p.id));
        setProperties((prev) => {
          const byId = new Map<string, Property>();
          for (const property of [...incoming, ...prev]) {
            if (!byId.has(property.id)) byId.set(property.id, property);
          }
          return Array.from(byId.values());
        });
      })
      .catch(() => {
        /* offline or static hosting: keep the bundled + local listings */
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load persistent deity image from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;

    getDeityImage().then((img) => {

      if (isMounted && img) {
        setBrokerConfig((prev) => {
          if (prev.deityImageUrl === img) return prev;

          return { ...prev, deityImageUrl: img };
        });
      }
    }).catch((err) => {
      console.warn('[App.tsx] Error in getDeityImage during startup:', err);
    });

    const handleDeityUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;

      if (customEvent.detail !== undefined) {
        setBrokerConfig((prev) => ({ ...prev, deityImageUrl: customEvent.detail || undefined }));
      } else {
        getDeityImage().then((img) => {
          if (isMounted) {

            setBrokerConfig((prev) => (prev.deityImageUrl === (img || undefined) ? prev : { ...prev, deityImageUrl: img || undefined }));
          }
        }).catch((err) => {
          console.warn('[App.tsx] Error re-fetching deity image on event:', err);
        });
      }
    };

    window.addEventListener('deity-image-updated', handleDeityUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('deity-image-updated', handleDeityUpdate);
    };
  }, []);

  // Sync broker config (strip huge base64 from localStorage to prevent QuotaExceeded error)
  useEffect(() => {
    try {
      const configToStore = { ...brokerConfig };
      if (configToStore.deityImageUrl && configToStore.deityImageUrl.startsWith('data:')) {
        configToStore.deityImageUrl = undefined; // saved in IndexedDB separately
      }
      writeJSON('brokerConfig', configToStore);
    } catch (e) {
      console.warn('Storage warning for broker config:', e);
    }
  }, [brokerConfig]);

  // --- Toasts ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync user account to localStorage
  useEffect(() => {
    try {
      writeJSON('userAccount', currentUser);
    } catch {
      // safe
    }
  }, [currentUser]);

  // Sync properties to localStorage
  useEffect(() => {
    try {
      writeJSON('properties', properties);
    } catch {
      // safe
    }
  }, [properties]);

  // Sync favorites
  useEffect(() => {
    try {
      writeJSON('favorites', favorites);
    } catch {
      // safe
    }
  }, [favorites]);

  // Sync compare
  useEffect(() => {
    try {
      writeJSON('compare', comparedIds);
    } catch {
      // safe
    }
  }, [comparedIds]);

  // Sync currency
  useEffect(() => {
    try {
      writeString('currency', currency);
    } catch {
      // safe
    }
  }, [currency]);

  // Sync communication profile
  useEffect(() => {
    try {
      writeJSON('commProfile', communicationProfile);
    } catch {
      // safe
    }
  }, [communicationProfile]);

  // --- Filter Updates ---
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    addToast('info', 'Filters Reset', 'All property filters have been restored to default.');
  };

  // --- Favorites Toggle ---
  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(propertyId);
      if (exists) {
        addToast('info', 'Removed from Saved', 'Property removed from your saved list.');
        return prev.filter((id) => id !== propertyId);
      } else {
        addToast('success', 'Saved Property', 'Property added to your favorites portfolio.');
        return [...prev, propertyId];
      }
    });
  };

  // --- Compare Toggle ---
  const toggleCompare = (propertyId: string) => {
    setComparedIds((prev) => {
      const exists = prev.includes(propertyId);
      if (exists) {
        return prev.filter((id) => id !== propertyId);
      } else {
        if (prev.length >= 4) {
          addToast('info', 'Comparison Limit', 'You can compare up to 4 properties simultaneously.');
          return prev;
        }
        addToast('success', 'Added to Comparison', 'Added to side-by-side comparison table.');
        return [...prev, propertyId];
      }
    });
  };

  // --- Add Property (Custom Price set by user) ---
  // Device photos are uploaded first, then the listing is persisted server-side
  // so it is visible to every visitor. If the server is unreachable the listing
  // is still added locally, but the owner is told it is device-only.
  const handleAddProperty = async (newProp: Property) => {
    let prepared: Property = newProp;

    if (newProp.images?.some((src) => src.startsWith('data:'))) {
      const uploadedImages: string[] = [];
      for (const src of newProp.images) {
        if (!src.startsWith('data:')) {
          uploadedImages.push(src);
          continue;
        }
        const upload = await uploadImage(src);
        uploadedImages.push(upload.ok && upload.data?.url ? upload.data.url : src);
      }
      prepared = { ...newProp, images: uploadedImages };
    }

    const saved = await createProperty(prepared as unknown as Record<string, unknown>);

    if (saved.ok && saved.data?.property) {
      const stored = saved.data.property as unknown as Property;
      setProperties((prev) => [stored, ...prev.filter((p) => p.id !== stored.id)]);
      setServerPropertyIds((prev) => [stored.id, ...prev]);
      addToast(
        'success',
        'Property Published!',
        `"${stored.title}" in ${stored.city} is now live for every visitor.`
      );
    } else {
      setProperties((prev) => [prepared, ...prev]);
      addToast(
        'info',
        'Saved On This Device',
        saved.data?.error ||
          'The server could not be reached, so this listing is visible only in this browser. Publish again once you are online.'
      );
    }

    // Switch filter region to match added property
    setFilters((prev) => ({ ...prev, region: prepared.region, city: '' }));
  };

  // --- Update Property Price (Set price on any existing listing) ---
  const handleUpdatePropertyPrice = async (propertyId: string, newPriceINR: number) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, priceINR: newPriceINR } : p))
    );
    if (selectedProperty && selectedProperty.id === propertyId) {
      setSelectedProperty((prev) => (prev ? { ...prev, priceINR: newPriceINR } : null));
    }

    if (serverPropertyIds.includes(propertyId)) {
      const res = await updateProperty(propertyId, { priceINR: newPriceINR });
      if (!res.ok) {
        addToast(
          'info',
          'Price Changed Locally',
          res.data?.error || 'The server did not accept the new price — please retry from the Owner Desk.'
        );
        return;
      }
    }

    addToast('success', 'Price Updated', 'Asking price updated successfully for this listing.');
  };

  // --- Save Communication Profile ---
  const handleSaveProfile = (profile: CommunicationProfile) => {
    setCommunicationProfile(profile);
    addToast(
      'success',
      'Profile & Languages Saved',
      `Communication profile updated with ${profile.spokenLanguages.join(', ')}.`
    );
  };

  // --- Submit Inquiry ---
  // Sends the lead to the backend (persisted + forwarded to the broker desk).
  // A local copy is always kept so nothing is lost if the server is offline,
  // and the user is told the truth about which channel actually delivered it.
  const handleSubmitInquiry = async (inquiry: InquirySubmission): Promise<InquirySubmitResult> => {
    const existingInquiries = readJSON<InquirySubmission[]>('inquiries', []);
    writeJSON('inquiries', [inquiry, ...existingInquiries].slice(0, 200));

    const result = await submitInquiry(inquiry);

    if (result.ok) {
      const reference = result.data?.id || inquiry.id;
      addToast(
        'success',
        'Enquiry Received',
        `${inquiry.agentName} will contact you on ${inquiry.userPhone}. Reference: ${reference}`
      );
      return {
        ok: true,
        mode: 'server',
        reference,
        message: 'Your site-visit request has reached the broker desk. You will get a call or WhatsApp message shortly.',
      };
    }

    addToast(
      'info',
      'Saved On This Device',
      'The server could not be reached, so your enquiry was saved locally. Please send it via WhatsApp or call us.'
    );
    return {
      ok: false,
      mode: 'local',
      message:
        'We could not reach the server. Your enquiry is saved in this browser — please send it with the WhatsApp button or call us directly so it is not missed.',
    };
  };

  // --- Open Mortgage with initial price ---
  const handleOpenMortgageWithPrice = (priceINR?: number) => {
    setMortgageInitialPrice(priceINR);
    setIsMortgageOpen(true);
  };

  // --- Filtered and Sorted Properties ---
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Region
      if (filters.region !== 'all' && prop.region !== filters.region) {
        return false;
      }

      // 2. City
      if (filters.city && !prop.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // 3. Listing Type (Buy / Rent)
      if (filters.listingType !== 'all' && prop.listingType !== filters.listingType) {
        return false;
      }

      // 4. Property Type
      if (filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }

      // 5. Price (in base INR)
      if (prop.priceINR < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice < 1500000000 && prop.priceINR > filters.maxPrice) {
        return false;
      }

      // 6. Bedrooms
      if (filters.bedrooms !== 'all') {
        if (filters.bedrooms === 5) {
          if (prop.bedrooms < 5) return false;
        } else {
          if (prop.bedrooms !== filters.bedrooms) return false;
        }
      }

      // 7. Bathrooms
      if (filters.bathrooms !== 'all') {
        if (filters.bathrooms === 5) {
          if (prop.bathrooms < 5) return false;
        } else {
          if (prop.bathrooms !== filters.bathrooms) return false;
        }
      }

      // 8. Verified Only
      if (filters.verifiedOnly && !prop.isVerified) {
        return false;
      }

      // 9. Ready to Move
      if (filters.readyToMoveOnly && !prop.isReadyToMove) {
        return false;
      }

      // 10. Amenities
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((a) => prop.amenities.includes(a));
        if (!hasAllAmenities) return false;
      }

      // 11. Search Query
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchesTitle = prop.title.toLowerCase().includes(q);
        const matchesTagline = prop.tagline.toLowerCase().includes(q);
        const matchesCity = prop.city.toLowerCase().includes(q);
        const matchesCountry = prop.country.toLowerCase().includes(q);
        const matchesLocality = prop.locality.toLowerCase().includes(q);
        const matchesDesc = prop.description.toLowerCase().includes(q);
        const matchesAgent = prop.agent.name.toLowerCase().includes(q);
        const matchesAmenity = prop.amenities.some((a) => a.toLowerCase().includes(q));

        if (
          !matchesTitle &&
          !matchesTagline &&
          !matchesCity &&
          !matchesCountry &&
          !matchesLocality &&
          !matchesDesc &&
          !matchesAgent &&
          !matchesAmenity
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') {
        return a.priceINR - b.priceINR;
      }
      if (filters.sortBy === 'price-desc') {
        return b.priceINR - a.priceINR;
      }
      if (filters.sortBy === 'newest') {
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
      if (filters.sortBy === 'size-desc') {
        return b.areaSqFt - a.areaSqFt;
      }
      // 'featured'
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [properties, filters]);

  const favoriteProperties = useMemo(() => {
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, favorites]);

  const comparedProperties = useMemo(() => {
    return properties.filter((p) => comparedIds.includes(p.id));
  }, [properties, comparedIds]);

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-[#C4A484]/30 selection:text-[#1A1A1A]">
      
      {/* Keyboard skip link (accessibility) */}
      <a
        href="#listings-catalog"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-[#1A1A1A] focus:shadow-lg focus:text-xs focus:font-bold"
      >
        Skip to property listings
      </a>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Header with Logo, Shortlist, Sign In, and List Land */}
      <Header
        currentRegion={filters.region}
        onRegionChange={(reg) => updateFilter('region', reg)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenAddProperty={() => setIsAddPropertyOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDarshan={() => setIsDarshanOpen(true)}
        customLogoUrl={brokerConfig.deityImageUrl}
        isOwner={currentUser.isLoggedIn && currentUser.role === 'agent'}
        onOpenOwnerDesk={() => setIsOwnerDeskOpen(true)}
        currency={currency}
        onCurrencyChange={(next) => {
          setCurrency(next);
          addToast('info', 'Currency Updated', `Prices are now shown in ${next}.`);
        }}
      />

      {/* Auspicious Daily Subha Horai & Panchangam Banner */}
      <AuspiciousMuhurthamBanner
        onOpenMuhurthamModal={() => setIsMuhurthamOpen(true)}
        brokerPhone={brokerConfig.primaryPhone}
      />

      {/* Auspicious Divine Entrance Banner (Lord Ganesha & Sri Varahi Amma) */}
      <DivineEntranceBanner
        customDeityImageUrl={brokerConfig.deityImageUrl}
        onOpenDarshan={() => setIsDarshanOpen(true)}
        onExplorePlots={() => {
          const el = document.getElementById('listings-catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero & Search */}
      <HeroSearch
        filters={filters}
        onUpdateFilter={updateFilter}
        onResetFilters={resetFilters}
        totalResultsCount={filteredProperties.length}
        onToggleFiltersModal={() => setIsFilterModalOpen(true)}
      />

      {/* Filter and Sorting Bar */}
      <FilterBar
        filters={filters}
        onUpdateFilter={updateFilter}
        onResetFilters={resetFilters}
        currency={currency}
        totalMatches={filteredProperties.length}
        isOpenModal={isFilterModalOpen}
        onCloseModal={() => setIsFilterModalOpen(false)}
      />

      {/* Trust, Security & Verification Strip */}
      <SecurityBanner
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        onOpenSecurityProtocol={() => setIsSecurityProtocolOpen(true)}
        onOpenBrokerSettings={() => setIsBrokerSettingsOpen(true)}
      />

      {/* Main Property Listings Grid */}
      <main id="listings-catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Market Highlights Banner */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[#E5E1DA]">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">
              Featured Land & Home Listings
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1816] flex items-center gap-2 mt-0.5">
              Available Land & Property Catalog
            </h2>
            <p className="text-xs font-sans text-[#736B63] mt-1">
              Direct owner sales with clear title, borewell water availability, and verified survey records.
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                currency={currency}
                areaUnit={filters.areaUnit}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={toggleFavorite}
                isCompared={comparedIds.includes(property.id)}
                onToggleCompare={toggleCompare}
                onSelectProperty={setSelectedProperty}
                onContactAgent={setContactProperty}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-[#E5E1DA] rounded-3xl p-14 text-center max-w-lg mx-auto space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center mx-auto text-[#8C7A65]">
              <Search className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">No Matching Properties Found</h3>
              <p className="text-xs font-sans text-[#736B63] leading-relaxed">
                We couldn’t find any properties matching your current filter criteria. Try loosening your price or location filters.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 font-sans">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsAddPropertyOpen(true)}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F4F0EA] text-[#1A1A1A] text-xs font-semibold border border-[#E5E1DA] transition"
              >
                List a Property
              </button>
            </div>
          </div>
        )}

        {/* Editorial "Why Sri Varahi Amma Real Estate" Feature Grid */}
        <section className="mt-14 pt-10 border-t border-[#E5E1DA] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">
                Platform & Land Verification
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-0.5">
                Why Choose Sri Varahi Amma Real Estate
              </h3>
              <p className="text-xs font-sans text-[#736B63]">
                Empowering buyers and landowners with Patta & title deed verification, neutral escrow token safety, and multilingual support.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsDocumentWalletOpen(true)}
                className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-200" />
                <span>Open Patta & Deed Vault</span>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] transition shadow-2xs flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>Read Complete Guide (English, தமிழ், తెలుగు, ಕನ್ನಡ, हिंदी)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] space-y-2 hover:border-[#8C7A65] transition shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Patta & Title Verification</h4>
              <p className="text-xs text-[#736B63] leading-relaxed">
                Verification of revenue records including Patta passbooks, Chitta, UDR extracts, and 30-year Encumbrance Certificates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] space-y-2 hover:border-[#8C7A65] transition shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Neutral Escrow Token Safety</h4>
              <p className="text-xs text-[#736B63] leading-relaxed">
                Your earnest booking deposit remains locked in a regulated trust account. 100% refunded if any document defect is found.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] space-y-2 hover:border-[#8C7A65] transition shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
                <Languages className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">5+ Native Languages</h4>
              <p className="text-xs text-[#736B63] leading-relaxed">
                Clear negotiations in Tamil, Telugu, Kannada, Hindi, and English with dedicated regional property concierges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] space-y-2 hover:border-[#8C7A65] transition shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">India & Global Portfolios</h4>
              <p className="text-xs text-[#736B63] leading-relaxed">
                Prime plots, agricultural parcels, sea-facing villas, and sky residences with multi-currency conversions.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E1DA] text-[#736B63] py-14 px-4 sm:px-6 lg:px-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white font-serif ring-1 ring-[#C4A484]/30 shadow-2xs">
                <Building2 className="w-4 h-4 text-[#C4A484]" />
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif font-bold text-base text-[#1A1A1A] tracking-tight">Sri Varahi Amma</span>
                <span className="font-serif font-bold text-sm text-[#8C7A65] tracking-tight">Real Estate</span>
              </div>
            </div>
            <p className="text-xs text-[#736B63] leading-relaxed">
              Premier land, plots, and luxury real estate portal. Clear-title lands with verified Patta records, neutral escrow token safety, and multi-language advisors.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>RERA & Title Verification Compliant</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-3.5">Indian Markets</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { updateFilter('city', 'Mumbai'); updateFilter('region', 'india'); }} className="hover:text-[#1A1A1A] transition">
                  Mumbai Luxury & Sea Face
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'Bengaluru'); updateFilter('region', 'india'); }} className="hover:text-[#1A1A1A] transition">
                  Bengaluru Tech Corridors
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'Goa'); updateFilter('region', 'india'); }} className="hover:text-[#1A1A1A] transition">
                  Goa Private Pool Villas
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'Delhi NCR'); updateFilter('region', 'india'); }} className="hover:text-[#1A1A1A] transition">
                  Delhi NCR & Golf Course Road
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'Hyderabad'); updateFilter('region', 'india'); }} className="hover:text-[#1A1A1A] transition">
                  Hyderabad Jubilee Hills
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-3.5">Global / Foreign Markets</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { updateFilter('city', 'Dubai'); updateFilter('region', 'international'); }} className="hover:text-[#1A1A1A] transition">
                  Dubai Palm Jumeirah & Downtown
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'London'); updateFilter('region', 'international'); }} className="hover:text-[#1A1A1A] transition">
                  London Mayfair & Westminster
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'New York'); updateFilter('region', 'international'); }} className="hover:text-[#1A1A1A] transition">
                  New York Central Park Penthouses
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'Singapore'); updateFilter('region', 'international'); }} className="hover:text-[#1A1A1A] transition">
                  Singapore Marina Bay Condos
                </button>
              </li>
              <li>
                <button onClick={() => { updateFilter('city', 'Bali'); updateFilter('region', 'international'); }} className="hover:text-[#1A1A1A] transition">
                  Bali Seminyak Tropical Villas
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Owner & Investor Tools</h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full text-left p-2.5 rounded-xl bg-[#FCFAF7] hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] font-semibold block transition"
              >
                🗣️ Spoken Languages & Profile
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="w-full text-left p-2.5 rounded-xl bg-[#FCFAF7] hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] block transition"
              >
                Platform Capabilities Guide
              </button>
              <button
                onClick={() => setIsAddPropertyOpen(true)}
                className="w-full text-left p-2.5 rounded-xl bg-[#FCFAF7] hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] block transition"
              >
                + List Property (Set Custom Price)
              </button>
              <button
                onClick={() => handleOpenMortgageWithPrice(undefined)}
                className="w-full text-left p-2.5 rounded-xl bg-[#FCFAF7] hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] block transition"
              >
                Mortgage & Home Loan EMI Calc
              </button>
              <button
                onClick={() => setIsAgentsOpen(true)}
                className="w-full text-left p-2.5 rounded-xl bg-[#FCFAF7] hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] block transition"
              >
                Verified Agent Directory
              </button>
            </div>
          </div>

        </div>

        {/* Real-time Broker Contact Bar & Footer Info */}
        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-[#E5E1DA] grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#E5E1DA]">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A65] mb-1">Direct Broker Desk</div>
            <div className="text-sm font-bold text-[#1A1A1A]">{brokerConfig.agencyName}</div>
            <div className="text-xs text-[#736B63] mt-0.5">{brokerConfig.brokerName}</div>
            <div className="text-xs text-[#736B63] mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8C7A65] shrink-0 mt-0.5" />
              <span>{brokerConfig.officeAddress}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A65] mb-1">Direct Calls & WhatsApp</div>
            <div className="text-xs text-[#1A1A1A] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Phone className="w-3.5 h-3.5 text-[#8C7A65]" />
                <a href={`tel:${brokerConfig.phone}`} className="hover:underline text-[#1A1A1A]">
                  Call: {brokerConfig.phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <a 
                  href={`https://wa.me/${brokerConfig.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Sri%20Varahi%20Amma%20Real%20Estate,%20I%20am%20inquiring%20about%20land%20and%20property%20listings.`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  WhatsApp: {brokerConfig.whatsapp}
                </a>
              </div>
              <div className="text-[11px] text-[#736B63]">{brokerConfig.operatingHours}</div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A65] mb-1">Trust, Privacy & Settings</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setIsPrivacyPolicyOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:bg-[#F4F0EA] transition font-medium"
                >
                  🔒 Privacy Policy
                </button>
                <button
                  onClick={() => setIsSecurityProtocolOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E1DA] text-[#1A1A1A] hover:bg-[#F4F0EA] transition font-medium"
                >
                  🛡️ Security & Deeds
                </button>
                <button
                  onClick={() => setIsBrokerSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#333] transition font-medium"
                >
                  ⚙️ Edit Contact Info
                </button>
              </div>
            </div>
            <div className="text-[10px] text-emerald-700 flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>HTTPS SSL 256-Bit Encrypted Data Stream</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#E5E1DA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#736B63] gap-2">
          <p>© {new Date().getFullYear()} {brokerConfig.agencyName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPrivacyPolicyOpen(true)} className="hover:underline">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setIsSecurityProtocolOpen(true)} className="hover:underline">Security Protocol</button>
            <span>•</span>
            <p>Clear-title lands, Patta verification & escrow token protection.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Compare Tray */}
      <CompareBar
        comparedProperties={comparedProperties.map((p) => ({ id: p.id, title: p.title, city: p.city }))}
        onOpenCompare={() => setIsCompareOpen(true)}
        onRemove={toggleCompare}
        onClearAll={() => {
          setComparedIds([]);
          addToast('info', 'Comparison Cleared', 'All properties were removed from the comparison tray.');
        }}
      />

      {/* --- ALL INTERACTIVE MODALS --- */}

      {/* Privacy Policy & Data Protection Modal */}
      {isPrivacyPolicyOpen && (
        <PrivacyPolicyModal
          isOpen={isPrivacyPolicyOpen}
          onClose={() => setIsPrivacyPolicyOpen(false)}
        />
      )}

      {/* Broker Contact & Business Settings Modal */}
      {isOwnerDeskOpen && (
        <OwnerDeskModal
          isOpen={isOwnerDeskOpen}
          onClose={() => setIsOwnerDeskOpen(false)}
          onAddProperty={() => setIsAddPropertyOpen(true)}
          onSelectPropertyId={(id) => {
            const match = properties.find((p) => p.id === id);
            if (match) {
              setIsOwnerDeskOpen(false);
              setSelectedProperty(match);
            }
          }}
        />
      )}

      {isBrokerSettingsOpen && (
        <BrokerContactSettingsModal
          isOpen={isBrokerSettingsOpen}
          onClose={() => setIsBrokerSettingsOpen(false)}
          config={brokerConfig}
          onSaveConfig={(newCfg) => {
            setBrokerConfig(newCfg);
            addToast('success', 'Broker Details Saved', 'Business contact, phone, and office details updated.');
          }}
        />
      )}

      {/* Security & Title Protocol Modal */}
      {isSecurityProtocolOpen && (
        <SecurityProtocolModal
          isOpen={isSecurityProtocolOpen}
          onClose={() => setIsSecurityProtocolOpen(false)}
          onOpenAddProperty={() => {
            setIsSecurityProtocolOpen(false);
            setIsAddPropertyOpen(true);
          }}
        />
      )}

      {/* Communication Profile Modal */}
      {isProfileOpen && (
        <CommunicationProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={communicationProfile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Platform Guide Modal */}
      {isGuideOpen && (
        <PlatformGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onOpenListProperty={() => setIsAddPropertyOpen(true)}
          onOpenMortgage={() => handleOpenMortgageWithPrice(undefined)}
          onOpenAgents={() => setIsAgentsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          currency={currency}
          isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
          onToggleFavorite={toggleFavorite}
          onContactAgent={(prop) => {
            setSelectedProperty(null);
            setContactProperty(prop);
          }}
          onUpdatePropertyPrice={handleUpdatePropertyPrice}
          onOpenMortgage={(price) => {
            handleOpenMortgageWithPrice(price);
          }}
          onOpenDocumentWallet={() => {
            setSelectedProperty(null);
            setIsDocumentWalletOpen(true);
          }}
          onOpenDealTracker={() => {
            setSelectedProperty(null);
            setIsDealTrackerOpen(true);
          }}
        />
      )}

      {/* Contact Agent & Schedule Tour Modal */}
      <ContactAgentModal
        property={contactProperty}
        onClose={() => setContactProperty(null)}
        currency={currency}
        onSubmitInquiry={handleSubmitInquiry}
        communicationProfile={communicationProfile}
      />

      {/* Add / List Property with Custom Price Modal */}
      {isAddPropertyOpen && (
        <AddPropertyModal
          isOpen={isAddPropertyOpen}
          onClose={() => setIsAddPropertyOpen(false)}
          onAddProperty={handleAddProperty}
          currentCurrency={currency}
        />
      )}

      {/* Mortgage / EMI Calculator Modal */}
      {isMortgageOpen && (
        <MortgageCalculatorModal
          isOpen={isMortgageOpen}
          onClose={() => setIsMortgageOpen(false)}
          currency={currency}
          initialPriceINR={mortgageInitialPrice}
        />
      )}

      {/* Comparison Modal */}
      {isCompareOpen && (
        <ComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          comparedProperties={comparedProperties}
          onRemoveFromCompare={toggleCompare}
          onClearAll={() => setComparedIds([])}
          currency={currency}
          onSelectProperty={(prop) => {
            setIsCompareOpen(false);
            setSelectedProperty(prop);
          }}
          onContactAgent={(prop) => {
            setIsCompareOpen(false);
            setContactProperty(prop);
          }}
        />
      )}

      {/* Agent Directory Modal */}
      {isAgentsOpen && (
        <AgentDirectoryModal
          isOpen={isAgentsOpen}
          onClose={() => setIsAgentsOpen(false)}
          communicationProfile={communicationProfile}
        />
      )}

      {/* Favorites Drawer */}
      {isFavoritesOpen && (
        <FavoritesDrawer
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favoriteProperties={favoriteProperties}
          onRemoveFavorite={toggleFavorite}
          onClearFavorites={() => setFavorites([])}
          currency={currency}
          onSelectProperty={(prop) => {
            setIsFavoritesOpen(false);
            setSelectedProperty(prop);
          }}
          onContactAgent={(prop) => {
            setIsFavoritesOpen(false);
            setContactProperty(prop);
          }}
        />
      )}

      {/* Cloud User Account & Authentication Modal */}
      {isAuthModalOpen && (
        <AuthAndUserAccountModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            addToast('success', 'Account Updated', `Profile updated as ${updated.role.toUpperCase()}.`);
          }}
          onOpenDocumentWallet={() => setIsDocumentWalletOpen(true)}
          onOpenDealTracker={() => setIsDealTrackerOpen(true)}
        />
      )}

      {/* Buyer & Vendor Document Wallet (Online & Offline Patta) */}
      {isDocumentWalletOpen && (
        <DocumentWalletModal
          isOpen={isDocumentWalletOpen}
          onClose={() => setIsDocumentWalletOpen(false)}
          currentUser={currentUser}
          onOpenDealTracker={() => setIsDealTrackerOpen(true)}
        />
      )}

      {/* Deal & Escrow Wallet Milestone Tracker */}
      {isDealTrackerOpen && (
        <DealEscrowTrackerModal
          isOpen={isDealTrackerOpen}
          onClose={() => setIsDealTrackerOpen(false)}
          currentUser={currentUser}
          currentCurrency={currency}
          onOpenDocumentWallet={() => setIsDocumentWalletOpen(true)}
        />
      )}

      {/* Divine Entrance & Auspicious Darshan Modal */}
      {isDarshanOpen && (
        <DivineDarshanModal
          isOpen={isDarshanOpen}
          onClose={() => setIsDarshanOpen(false)}
          customDeityImageUrl={brokerConfig.deityImageUrl}
          onExplorePlots={() => {
            setIsDarshanOpen(false);
            const el = document.getElementById('listings-catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Auspicious Muhurtham, Horai & Vastu Guide Modal */}
      {isMuhurthamOpen && (
        <MuhurthamDetailsModal
          isOpen={isMuhurthamOpen}
          onClose={() => setIsMuhurthamOpen(false)}
          brokerPhone={brokerConfig.primaryPhone}
        />
      )}

    </div>
  );
}
