export type PropertyRegion = 'all' | 'india' | 'international';
export type PropertyType = 'all' | 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'commercial' | 'plot';
export type ListingType = 'all' | 'sale' | 'rent';
export type CurrencyCode = 'INR' | 'USD' | 'AED' | 'GBP' | 'EUR';

export interface Agent {
  id: string;
  name: string;
  photo: string;
  phone: string;
  whatsapp: string;
  email: string;
  agency: string;
  rating: number;
  reviewsCount: number;
  languages: string[];
  experienceYears: number;
  verified: boolean;
  region: 'india' | 'international' | 'both';
  city: string;
}

export interface NearbySpot {
  name: string;
  distance: string;
  type: 'transit' | 'school' | 'hospital' | 'shopping' | 'beach' | 'airport';
}

export interface Property {
  id: string;
  title: string;
  tagline: string;
  description: string;
  region: 'india' | 'international';
  country: string;
  countryCode: string; // 'IN', 'AE', 'US', 'GB', 'SG', 'ID', etc.
  city: string;
  stateOrProvince: string;
  address: string;
  locality: string;
  propertyType: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'commercial' | 'plot';
  listingType: 'sale' | 'rent';
  priceINR: number; // Base reference in Indian Rupees
  customCurrency?: CurrencyCode;
  originalPrice?: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  plotAreaDetails?: {
    acres?: number;
    gunthas?: number;
    cents?: number;
    sqYards?: number;
    zoning: 'Residential' | 'Agricultural NA' | 'Commercial' | 'Mixed-Use' | 'Freehold Estate';
    roadFrontage?: string;
    surveyNumber?: string;
    boundaryFencing?: boolean;
  };
  yearBuilt: number;
  furnishedStatus: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  parkingSpaces: number;
  floor?: string;
  totalFloors?: number;
  images: string[];
  amenities: string[];
  reraId?: string; // For Indian properties / International Escrow ID
  securityProtocol?: {
    isDeedVerified: boolean;
    isEscrowProtected: boolean;
    isOwnerPinSecured: boolean;
    isKycAmlCompliant: boolean;
    securityProtocolLevel: 'Tier-1 Certified' | 'Bank-Grade Escrow' | 'Government RERA Registered';
    registryRef: string;
  };
  isFeatured: boolean;
  isVerified: boolean;
  isReadyToMove: boolean;
  isUserAdded?: boolean;
  addedDate: string;
  agent: Agent;
  nearbySpots?: NearbySpot[];
  virtualTourUrl?: string;
}

export type AreaUnit = 
  | 'auto'
  | 'cents'
  | 'acres'
  | 'sqft'
  | 'sqm'
  | 'grounds'
  | 'gunthas'
  | 'sqyards'
  | 'hectares';

export interface FilterState {
  query: string;
  region: PropertyRegion;
  country: string;
  city: string;
  listingType: ListingType;
  propertyType: PropertyType;
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'all';
  bathrooms: number | 'all';
  verifiedOnly: boolean;
  readyToMoveOnly: boolean;
  amenities: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'size-desc';
  areaUnit: AreaUnit;
  landScaleFilter?: 'all' | 'cents_under_20' | 'cents_20_100' | 'acres_1_5' | 'acres_5_plus';
}

export interface CommunicationProfile {
  name: string;
  email: string;
  phone: string;
  primaryLanguage: 'English' | 'Tamil' | 'Telugu' | 'Kannada' | 'Hindi' | string;
  spokenLanguages: string[];
  preferredChannel: 'whatsapp' | 'call' | 'email' | 'video';
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening' | 'anytime';
  investorType: 'nri' | 'luxury_buyer' | 'first_time' | 'investor' | 'seller';
  serviceModePreference: 'hybrid' | 'online_escrow' | 'offline_in_person';
  notes: string;
}

export type DocumentTypeCategory = 
  | 'patta_chitta' 
  | 'extract_7_12' 
  | 'khata_certificate' 
  | 'sale_title_deed' 
  | 'encumbrance_certificate' 
  | 'rera_layout_sanction' 
  | 'pan_aadhaar_kyc' 
  | 'bank_noc' 
  | 'possession_letter'
  | 'power_of_attorney'
  | 'other';

export interface VaultDocument {
  id: string;
  userId: string;
  documentType: DocumentTypeCategory;
  title: string;
  documentNumber?: string;
  propertyTitle?: string;
  verificationMode: 'online_upload' | 'offline_in_person' | 'doorstep_courier_seal';
  status: 'verified' | 'in_review' | 'scheduled_offline_visit' | 'pending';
  fileUrl?: string;
  fileName?: string;
  offlineAppointment?: {
    date: string;
    time: string;
    locationType: 'office' | 'property_site' | 'sub_registrar_office' | 'doorstep';
    verifiedBy: string;
    verificationReference: string;
  };
  tamperProofSealId?: string;
  legalRemarks?: string;
  uploadedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'vendor' | 'landowner' | 'agent';
  avatar?: string;
  isLoggedIn: boolean;
  kycStatus: 'Verified' | 'Pending' | 'Offline_Scheduled';
  preferredLanguage: string;
  preferredServiceMode: 'hybrid' | 'online_escrow' | 'offline_in_person';
  walletBalanceINR: number;
  escrowLockedINR: number;
  memberSince: string;
}

export interface DealMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  mode: 'online' | 'offline' | 'hybrid';
  dateCompleted?: string;
}

export interface DealTransaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyPriceINR: number;
  buyerName: string;
  vendorName: string;
  serviceMode: 'online' | 'offline' | 'hybrid';
  earnestTokenINR: number;
  escrowStatus: 'Token Secured in Escrow' | 'Legal Title Cleared' | 'Sub-Registrar Scheduled' | 'Deed Registered' | 'Funds Settled';
  brokerDesk: string;
  milestones: DealMilestone[];
  createdAt: string;
}

export interface InquirySubmission {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyPrice: string;
  agentName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userLanguage?: string;
  spokenLanguages?: string[];
  tourType: 'in-person' | 'video' | 'phone' | 'message';
  preferredDate?: string;
  preferredTime?: string;
  message: string;
  createdAt: string;
}
