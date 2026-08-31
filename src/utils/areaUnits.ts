import { PropertyRegion, AreaUnit } from '../types';

export type { AreaUnit };

export interface UnitConfig {
  code: AreaUnit;
  name: string;
  shortLabel: string;
  category: 'indian' | 'international' | 'system';
  sqFtFactor: number; // 1 unit in Sq.Ft
  description: string;
  regionHint: 'India (TN, KA, AP, KL)' | 'India & Global' | 'International (ISO / Metric)' | 'Global Standard';
}

export const AREA_UNITS_CONFIG: Record<AreaUnit, UnitConfig> = {
  auto: {
    code: 'auto',
    name: 'Territory Auto (Cents/Acres in India, SqFt/SqM Global)',
    shortLabel: 'Auto',
    category: 'system',
    sqFtFactor: 1,
    description: 'Automatically shows Cents/Acres for Indian land and SqFt/SqM for foreign estates',
    regionHint: 'Global Standard',
  },
  cents: {
    code: 'cents',
    name: 'Cents (South Indian Land Standard)',
    shortLabel: 'Cents',
    category: 'indian',
    sqFtFactor: 435.6, // 1 Cent = 435.6 sq ft (100 Cents = 1 Acre)
    description: '1 Cent = 435.6 Sq.Ft = ~40.47 Sq.M (100 Cents = 1 Acre). Standard in Tamil Nadu, Karnataka & Kerala.',
    regionHint: 'India (TN, KA, AP, KL)',
  },
  acres: {
    code: 'acres',
    name: 'Acres (India & International)',
    shortLabel: 'Acres',
    category: 'indian',
    sqFtFactor: 43560, // 1 Acre = 43,560 sq ft = 100 Cents
    description: '1 Acre = 100 Cents = 43,560 Sq.Ft = 4,046.86 Sq.M = 40 Gunthas.',
    regionHint: 'India & Global',
  },
  grounds: {
    code: 'grounds',
    name: 'Grounds (Tamil Nadu Urban Standard)',
    shortLabel: 'Grounds',
    category: 'indian',
    sqFtFactor: 2400, // 1 Ground = 2,400 sq ft = 5.51 Cents
    description: '1 Ground = 2,400 Sq.Ft = 5.51 Cents = 222.96 Sq.M.',
    regionHint: 'India (TN, KA, AP, KL)',
  },
  gunthas: {
    code: 'gunthas',
    name: 'Gunthas (Karnataka & West India)',
    shortLabel: 'Gunthas',
    category: 'indian',
    sqFtFactor: 1089, // 1 Guntha = 1,089 sq ft = 2.5 Cents (40 Gunthas = 1 Acre)
    description: '1 Guntha = 1,089 Sq.Ft = 2.5 Cents = 101.17 Sq.M (40 Gunthas = 1 Acre).',
    regionHint: 'India (TN, KA, AP, KL)',
  },
  sqyards: {
    code: 'sqyards',
    name: 'Square Yards / Gaj',
    shortLabel: 'Sq.Yds',
    category: 'indian',
    sqFtFactor: 9, // 1 Sq Yard = 9 sq ft
    description: '1 Sq.Yard (Gaj) = 9 Sq.Ft = 0.836 Sq.M.',
    regionHint: 'India & Global',
  },
  sqft: {
    code: 'sqft',
    name: 'Square Feet (International Imperial)',
    shortLabel: 'Sq.Ft',
    category: 'international',
    sqFtFactor: 1,
    description: 'International imperial standard measurement for residential & commercial spaces.',
    regionHint: 'International (ISO / Metric)',
  },
  sqm: {
    code: 'sqm',
    name: 'Square Meters (International Metric)',
    shortLabel: 'Sq.M (m²)',
    category: 'international',
    sqFtFactor: 10.7639104, // 1 Sq.M = 10.7639 sq ft
    description: '1 Sq.Meter = 10.764 Sq.Ft (International Metric ISO system).',
    regionHint: 'International (ISO / Metric)',
  },
  hectares: {
    code: 'hectares',
    name: 'Hectares (Metric Land Standard)',
    shortLabel: 'Hectares',
    category: 'international',
    sqFtFactor: 107639.104, // 1 Hectare = 10,000 sq m = 107,639.1 sq ft = 2.471 Acres
    description: '1 Hectare = 10,000 Sq.M = 2.471 Acres = 247.1 Cents.',
    regionHint: 'International (ISO / Metric)',
  },
};

export interface LandConversionBreakdown {
  cents: number;
  acres: number;
  sqFt: number;
  sqMeters: number;
  grounds: number;
  gunthas: number;
  sqYards: number;
  hectares: number;
  pricePerCentINR?: number;
  pricePerAcreINR?: number;
  pricePerSqFtINR?: number;
  pricePerSqMetersINR?: number;
}

/**
 * Converts any value in Sq.Ft to target unit
 */
export function convertFromSqFt(areaSqFt: number, targetUnit: AreaUnit | string = 'auto'): number {
  if (targetUnit === 'auto') return areaSqFt;
  const config = AREA_UNITS_CONFIG[targetUnit as AreaUnit] || AREA_UNITS_CONFIG.sqft;
  return areaSqFt / config.sqFtFactor;
}

/**
 * Converts any value in source unit to base Sq.Ft
 */
export function convertToSqFt(value: number, sourceUnit: AreaUnit | string = 'auto'): number {
  if (sourceUnit === 'auto') return value;
  const config = AREA_UNITS_CONFIG[sourceUnit as AreaUnit] || AREA_UNITS_CONFIG.sqft;
  return value * config.sqFtFactor;
}

/**
 * Generates an exhaustive multi-unit conversion breakdown for any property or land plot
 */
export function getLandConversions(areaSqFt: number, priceINR?: number): LandConversionBreakdown {
  const sqFt = areaSqFt || 0;
  const cents = sqFt / 435.6;
  const acres = sqFt / 43560;
  const sqMeters = sqFt / 10.7639104;
  const grounds = sqFt / 2400;
  const gunthas = sqFt / 1089;
  const sqYards = sqFt / 9;
  const hectares = sqFt / 107639.104;

  const result: LandConversionBreakdown = {
    cents: Number(cents.toFixed(cents < 10 ? 2 : 1)),
    acres: Number(acres.toFixed(acres < 1 ? 3 : 2)),
    sqFt: Math.round(sqFt),
    sqMeters: Number(sqMeters.toFixed(1)),
    grounds: Number(grounds.toFixed(2)),
    gunthas: Number(gunthas.toFixed(2)),
    sqYards: Number(sqYards.toFixed(1)),
    hectares: Number(hectares.toFixed(3)),
  };

  if (priceINR && priceINR > 0) {
    result.pricePerCentINR = cents > 0 ? Math.round(priceINR / cents) : 0;
    result.pricePerAcreINR = acres > 0 ? Math.round(priceINR / acres) : 0;
    result.pricePerSqFtINR = sqFt > 0 ? Math.round(priceINR / sqFt) : 0;
    result.pricePerSqMetersINR = sqMeters > 0 ? Math.round(priceINR / sqMeters) : 0;
  }

  return result;
}

/**
 * Formats land area intelligently for UI presentation:
 * - Indian Land (Tamil Nadu / Karnataka / India): Displays in Cents or Acres with dual-reference
 * - International / Foreign: Displays in Sq.Ft or Sq.Meters or Hectares
 */
export function formatLandArea(
  areaSqFt: number,
  preferredUnit: AreaUnit | string = 'auto',
  region: PropertyRegion | 'india' | 'international' | 'all' | string = 'india',
  propertyType?: string
): {
  primary: string;
  secondary: string;
  unitLabel: string;
  isLandPlot: boolean;
} {
  const isLand = propertyType === 'plot' || areaSqFt >= 20000;
  const conv = getLandConversions(areaSqFt);
  const normalizedUnit = (preferredUnit || 'auto') as AreaUnit;

  // If specific unit selected by user
  if (normalizedUnit !== 'auto') {
    const val = convertFromSqFt(areaSqFt, normalizedUnit);
    const unitCfg = AREA_UNITS_CONFIG[normalizedUnit] || AREA_UNITS_CONFIG.sqft;
    
    let formattedVal: string;
    if (normalizedUnit === 'acres' || normalizedUnit === 'hectares') {
      formattedVal = val < 1 ? val.toFixed(3) : val.toFixed(2);
    } else if (normalizedUnit === 'cents' || normalizedUnit === 'grounds' || normalizedUnit === 'gunthas') {
      formattedVal = val < 10 ? val.toFixed(2) : val.toFixed(1);
    } else if (normalizedUnit === 'sqm') {
      formattedVal = val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    } else {
      formattedVal = Math.round(val).toLocaleString();
    }

    // Secondary hint
    let secondary = '';
    if (normalizedUnit === 'cents') {
      secondary = conv.acres >= 0.5 ? `(${conv.acres} Acres • ${conv.sqFt.toLocaleString()} Sq.Ft)` : `(${conv.sqFt.toLocaleString()} Sq.Ft)`;
    } else if (normalizedUnit === 'acres') {
      secondary = `(${conv.cents.toLocaleString()} Cents • ${conv.hectares} Ha)`;
    } else if (normalizedUnit === 'sqm') {
      secondary = `(${conv.sqFt.toLocaleString()} Sq.Ft)`;
    } else if (normalizedUnit === 'sqft') {
      secondary = region === 'india' ? `(${conv.cents} Cents)` : `(${conv.sqMeters.toLocaleString()} m²)`;
    } else {
      secondary = `(${conv.sqFt.toLocaleString()} Sq.Ft)`;
    }

    return {
      primary: `${formattedVal} ${unitCfg.shortLabel}`,
      secondary,
      unitLabel: unitCfg.shortLabel,
      isLandPlot: isLand,
    };
  }

  // AUTO Mode: Territory Specific
  if (region === 'india' || region === 'all') {
    if (isLand) {
      if (conv.acres >= 1) {
        return {
          primary: `${conv.acres} Acres`,
          secondary: `(${conv.cents.toLocaleString()} Cents • ${conv.sqFt.toLocaleString()} Sq.Ft)`,
          unitLabel: 'Acres',
          isLandPlot: true,
        };
      } else {
        return {
          primary: `${conv.cents} Cents`,
          secondary: `(${conv.sqFt.toLocaleString()} Sq.Ft • ${conv.acres} Acres)`,
          unitLabel: 'Cents',
          isLandPlot: true,
        };
      }
    } else {
      // Residential / Apartment / Villa in India
      return {
        primary: `${conv.sqFt.toLocaleString()} Sq.Ft`,
        secondary: conv.cents <= 20 ? `(~${conv.cents} Cents • ${conv.sqMeters} m²)` : `(~${conv.sqMeters} m²)`,
        unitLabel: 'Sq.Ft',
        isLandPlot: false,
      };
    }
  } else {
    // International / Foreign Territory
    if (isLand && conv.acres >= 1) {
      return {
        primary: `${conv.acres} Acres (${conv.hectares} Ha)`,
        secondary: `(${conv.sqMeters.toLocaleString()} m² • ${conv.sqFt.toLocaleString()} Sq.Ft)`,
        unitLabel: 'Acres',
        isLandPlot: true,
      };
    } else {
      return {
        primary: `${conv.sqFt.toLocaleString()} Sq.Ft`,
        secondary: `(${conv.sqMeters.toLocaleString()} m² Metric)`,
        unitLabel: 'Sq.Ft',
        isLandPlot: false,
      };
    }
  }
}
