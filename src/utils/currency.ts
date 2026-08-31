import { CurrencyCode } from '../types';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromINR: number; // Multiply INR by this to get target
  rateToINR: number;   // Multiply target by this to get INR
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateFromINR: 1,
    rateToINR: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromINR: 1 / 86.5,
    rateToINR: 86.5,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    rateFromINR: 1 / 23.55,
    rateToINR: 23.55,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromINR: 1 / 109.5,
    rateToINR: 109.5,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromINR: 1 / 91.2,
    rateToINR: 91.2,
  },
};

/**
 * Converts an amount in base INR to target currency
 */
export function convertFromINR(amountInINR: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.INR;
  return amountInINR * config.rateFromINR;
}

/**
 * Converts an amount in source currency into base INR
 */
export function convertToINR(amount: number, sourceCurrency: CurrencyCode): number {
  const config = CURRENCY_CONFIGS[sourceCurrency] || CURRENCY_CONFIGS.INR;
  return amount * config.rateToINR;
}

/**
 * Formats an amount in base INR to the selected currency with readable suffixes
 * e.g., ₹2.45 Cr, ₹85 L, $1.25M, AED 4.5M, £950K
 */
export function formatPrice(
  amountInINR: number,
  currency: CurrencyCode = 'INR',
  listingType: 'sale' | 'rent' = 'sale'
): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  const converted = convertFromINR(amountInINR, currency);

  if (listingType === 'rent') {
    if (currency === 'INR') {
      if (converted >= 100000) {
        return `₹${(converted / 100000).toFixed(2).replace(/\.00$/, '')} Lakh/mo`;
      }
      return `₹${Math.round(converted).toLocaleString('en-IN')}/mo`;
    }
    return `${config.symbol}${Math.round(converted).toLocaleString()}/mo`;
  }

  // For Sale
  if (currency === 'INR') {
    if (converted >= 10000000) {
      const cr = converted / 10000000;
      return `₹${cr >= 10 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
    } else if (converted >= 100000) {
      const lk = converted / 100000;
      return `₹${lk.toFixed(1)} Lakh`;
    } else {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
  }

  // International currencies (USD, AED, GBP, EUR)
  if (converted >= 1000000) {
    const mil = converted / 1000000;
    return `${config.symbol}${mil.toFixed(2).replace(/\.00$/, '')}M`;
  } else if (converted >= 1000) {
    const k = converted / 1000;
    return `${config.symbol}${k.toFixed(0)}K`;
  } else {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }
}

/**
 * Formats exact numerical amount with commas according to currency
 */
export function formatExactPrice(
  amountInINR: number,
  currency: CurrencyCode = 'INR'
): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
  const converted = Math.round(convertFromINR(amountInINR, currency));

  if (currency === 'INR') {
    return `₹${converted.toLocaleString('en-IN')}`;
  }
  return `${config.symbol}${converted.toLocaleString()}`;
}

/**
 * Calculates monthly EMI
 */
export function calculateEMI(
  principalInINR: number,
  annualInterestRatePct: number,
  tenureYears: number
): number {
  const principal = principalInINR;
  const monthlyRate = annualInterestRatePct / 12 / 100;
  const totalMonths = tenureYears * 12;

  if (monthlyRate === 0) return principal / totalMonths;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(emi);
}
