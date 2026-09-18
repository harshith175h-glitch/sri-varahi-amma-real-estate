/**
 * Broker/agency contact defaults.
 *
 * These live in their own module (rather than inside the settings modal) so
 * that App.tsx can read the config without statically importing the modal
 * component. A module that is both statically and dynamically imported cannot
 * be code-split — Rollup hoists it into the entry chunk, which previously
 * dragged the whole modal graph into the initial bundle.
 */
export interface BrokerContactConfig {
  brokerName: string;
  agencyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  officeAddress: string;
  primaryLocations: string[];
  operatingHours: string;
  googleRating: string;
  totalDealsClosed: string;
  deityImageUrl?: string;
}

export const DEFAULT_BROKER_CONFIG: BrokerContactConfig = {
  brokerName: 'Sri Varahi Amma Broker Desk (Harshith & Team)',
  agencyName: 'Sri Varahi Amma Real Estate',
  phone: '+91 6383040407',
  whatsapp: '+91 6383040407',
  email: 'harshith175h@gmail.com',
  officeAddress: 'Main Road, Hosur, Krishnagiri District, Tamil Nadu - 635109 (TN & Karnataka Border)',
  primaryLocations: [
    'Hosur (City HQ)',
    'Krishnagiri District',
    'Bangalore / Bengaluru Border',
    'Attibele & Electronic City Corridor',
    'Thally & Denkanikottai',
    'Tamil Nadu (All Districts)',
    'Karnataka (Statewide)',
    'National & International NRI Deals',
  ],
  operatingHours: 'Monday - Sunday: 8:00 AM - 9:00 PM IST (Direct Phone & WhatsApp)',
  googleRating: '4.9 ★ (150+ Verified Land Closings)',
  totalDealsClosed: '300+ Verified Land & Property Parcels Handled',
  deityImageUrl: undefined,
};
