// Auspicious Hindu Panchangam & Muhurtham calculations for Real Estate & Land Registrations

export interface MuhurthamSlot {
  timeWindow: string;
  name: string;
  significance: string;
  recommendedFor: string[];
  planet: string;
}

export interface DayPanchangam {
  dateString: string;
  dayName: string;
  tamilMonthName: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  rahuKalam: string;
  yamagandam: string;
  gulikaKalam: string;
  amritKaalam: string;
  subhaHoraiSlots: MuhurthamSlot[];
  isAuspiciousForRegistration: boolean;
  propertyBlessingNote: string;
}

export interface AuspiciousDateItem {
  date: string;
  day: string;
  nakshatra: string;
  tithi: string;
  timing: string;
  type: 'Registration' | 'Bhumi Pooja' | 'Griha Pravesh' | 'Agreement / Token';
  bestFor: string;
  auspiciousness: 'High' | 'Very High' | 'Golden Muhurtham';
}

// Weekly Rahu Kalam and Yamagandam standard timings (IST)
const WEEKDAY_DATA: Record<number, {
  dayName: string;
  rahu: string;
  yama: string;
  gulika: string;
  horaiSlots: MuhurthamSlot[];
}> = {
  0: { // Sunday
    dayName: 'Sunday (Bhanuvara)',
    rahu: '4:30 PM - 6:00 PM',
    yama: '12:00 PM - 1:30 PM',
    gulika: '3:00 PM - 4:30 PM',
    horaiSlots: [
      { timeWindow: '7:30 AM - 9:00 AM', name: 'Sukra Horai (Venus)', significance: 'Prosperity & Asset Acquisition', recommendedFor: ['Agreement Signing', 'Token Advance'], planet: 'Venus' },
      { timeWindow: '9:00 AM - 10:30 AM', name: 'Budha Horai (Mercury)', significance: 'Document Verification & Clear Title', recommendedFor: ['Patta Verification', 'Legal Search'], planet: 'Mercury' },
      { timeWindow: '1:30 PM - 3:00 PM', name: 'Guru Horai (Jupiter)', significance: 'Long-term Wealth & Foundation Growth', recommendedFor: ['Land Registration', 'Site Visit'], planet: 'Jupiter' }
    ]
  },
  1: { // Monday
    dayName: 'Monday (Somavara)',
    rahu: '7:30 AM - 9:00 AM',
    yama: '10:30 AM - 12:00 PM',
    gulika: '1:30 PM - 3:00 PM',
    horaiSlots: [
      { timeWindow: '9:00 AM - 10:30 AM', name: 'Guru Horai (Jupiter)', significance: 'Highest Auspiciousness for Property Deed', recommendedFor: ['Sub-Registrar Office Visit', 'Deed Execution'], planet: 'Jupiter' },
      { timeWindow: '12:00 PM - 1:30 PM', name: 'Sukra Horai (Venus)', significance: 'Wealth and Family Prosperity', recommendedFor: ['Token Advance', 'Agreement Signing'], planet: 'Venus' },
      { timeWindow: '3:00 PM - 4:30 PM', name: 'Chandra Horai (Moon)', significance: 'Peaceful Land Ownership & Water Vitality', recommendedFor: ['Farmland Purchase', 'Site Inspection'], planet: 'Moon' }
    ]
  },
  2: { // Tuesday
    dayName: 'Tuesday (Mangalavara)',
    rahu: '3:00 PM - 4:30 PM',
    yama: '9:00 AM - 10:30 AM',
    gulika: '12:00 PM - 1:30 PM',
    horaiSlots: [
      { timeWindow: '10:30 AM - 12:00 PM', name: 'Sukra Horai (Venus)', significance: 'Golden Wealth & Protection', recommendedFor: ['Token Advance', 'Asset Planning'], planet: 'Venus' },
      { timeWindow: '1:30 PM - 3:00 PM', name: 'Budha Horai (Mercury)', significance: 'Precision Cadastral Survey & Documentation', recommendedFor: ['FMB Sketch Review', 'Boundary Marking'], planet: 'Mercury' }
    ]
  },
  3: { // Wednesday
    dayName: 'Wednesday (Budhavara)',
    rahu: '12:00 PM - 1:30 PM',
    yama: '7:30 AM - 9:00 AM',
    gulika: '10:30 AM - 12:00 PM',
    horaiSlots: [
      { timeWindow: '6:00 AM - 7:30 AM', name: 'Budha Horai (Mercury)', significance: 'Sharp Legal Clearance & Clean Title', recommendedFor: ['Encumbrance (EC) Verification', 'Patta Search'], planet: 'Mercury' },
      { timeWindow: '9:00 AM - 10:30 AM', name: 'Guru Horai (Jupiter)', significance: 'Master Land Deed Blessing', recommendedFor: ['Sub-Registrar Registration', 'Sale Deed Signing'], planet: 'Jupiter' },
      { timeWindow: '4:30 PM - 6:00 PM', name: 'Sukra Horai (Venus)', significance: 'Real Estate Growth & Prosperity', recommendedFor: ['Token Advance', 'Handover Ceremony'], planet: 'Venus' }
    ]
  },
  4: { // Thursday
    dayName: 'Thursday (Guruvara)',
    rahu: '1:30 PM - 3:00 PM',
    yama: '6:00 AM - 7:30 AM',
    gulika: '9:00 AM - 10:30 AM',
    horaiSlots: [
      { timeWindow: '6:00 AM - 7:30 AM', name: 'Guru Horai (Jupiter)', significance: 'Sacred Gold Standard for Real Estate', recommendedFor: ['Bhumi Pooja', 'Foundation Stone Laying'], planet: 'Jupiter' },
      { timeWindow: '10:30 AM - 12:00 PM', name: 'Sukra Horai (Venus)', significance: 'Wealth Multiplier & Griha Pravesh', recommendedFor: ['Land Registration', 'Sale Agreement'], planet: 'Venus' },
      { timeWindow: '3:00 PM - 4:30 PM', name: 'Budha Horai (Mercury)', significance: 'Accurate Land Measurement & Clear Deed', recommendedFor: ['Site Measurement', 'Deed Finalization'], planet: 'Mercury' }
    ]
  },
  5: { // Friday
    dayName: 'Friday (Sukravara)',
    rahu: '10:30 AM - 12:00 PM',
    yama: '3:00 PM - 4:30 PM',
    gulika: '7:30 AM - 9:00 AM',
    horaiSlots: [
      { timeWindow: '6:00 AM - 7:30 AM', name: 'Sukra Horai (Venus)', significance: 'Goddess Sri Varahi Divine Grace Window', recommendedFor: ['Token Advance', 'Agreement Signing', 'Griha Pravesh'], planet: 'Venus' },
      { timeWindow: '9:00 AM - 10:30 AM', name: 'Guru Horai (Jupiter)', significance: 'Crown Prosperity for Land & Asset Ownership', recommendedFor: ['Sub-Registrar Registration', 'Key Handover'], planet: 'Jupiter' },
      { timeWindow: '1:30 PM - 3:00 PM', name: 'Budha Horai (Mercury)', significance: 'Clear Legal Titles & Permanent Ownership', recommendedFor: ['Sale Deed Execution', 'Patta Transfer'], planet: 'Mercury' }
    ]
  },
  6: { // Saturday
    dayName: 'Saturday (Shanivara)',
    rahu: '9:00 AM - 10:30 AM',
    yama: '1:30 PM - 3:00 PM',
    gulika: '6:00 AM - 7:30 AM',
    horaiSlots: [
      { timeWindow: '7:30 AM - 9:00 AM', name: 'Guru Horai (Jupiter)', significance: 'Immense Wisdom & Vastu Blessing', recommendedFor: ['Site Visit & Inspection', 'Token Advance'], planet: 'Jupiter' },
      { timeWindow: '10:30 AM - 12:00 PM', name: 'Sukra Horai (Venus)', significance: 'Commercial & Residential Real Estate Blessing', recommendedFor: ['Agreement Finalization', 'Investment Booking'], planet: 'Venus' },
      { timeWindow: '3:00 PM - 4:30 PM', name: 'Budha Horai (Mercury)', significance: 'Document Search & Survey Review', recommendedFor: ['Legal Verification', 'Layout Boundary Walk'], planet: 'Mercury' }
    ]
  }
};

const SAMPLE_NAKSHATRAS = [
  'Rohini (Favorable for Land & Construction)',
  'Uttara Phalguni (Excellent for Land Purchase)',
  'Hasta (Supreme for Document Signing & Token)',
  'Swati (Great for Long-Term Wealth Multiplication)',
  'Anuradha (Ideal for Registration & Handover)',
  'Uttara Ashadha (Sacred for Foundation Laying)',
  'Revati (Favorable for Clear Patta Transfer)',
  'Sravana (Auspicious for Key Handover)',
  'Mrigashira (Peaceful Agricultural Farmland)'
];

const SAMPLE_TITHIS = [
  'Sukla Paksha Dvitiya',
  'Sukla Paksha Tritiya (Akshaya Tithi)',
  'Sukla Paksha Panchami',
  'Sukla Paksha Saptami',
  'Sukla Paksha Dashami',
  'Sukla Paksha Ekadashi',
  'Sukla Paksha Trayodashi'
];

export function getTodayPanchangam(): DayPanchangam {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayData = WEEKDAY_DATA[dayOfWeek] || WEEKDAY_DATA[0];

  const dateFormatted = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate deterministic index based on day of year for consistent daily data
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const tithi = SAMPLE_TITHIS[dayOfYear % SAMPLE_TITHIS.length];
  const nakshatra = SAMPLE_NAKSHATRAS[dayOfYear % SAMPLE_NAKSHATRAS.length];

  return {
    dateString: dateFormatted,
    dayName: dayData.dayName,
    tamilMonthName: 'Subha Muhurtham Kaalam',
    tithi,
    nakshatra,
    yoga: 'Siddha Yoga / Amrita Yoga',
    rahuKalam: dayData.rahu,
    yamagandam: dayData.yama,
    gulikaKalam: dayData.gulika,
    amritKaalam: '9:15 AM - 10:45 AM & 4:15 PM - 5:30 PM',
    subhaHoraiSlots: dayData.horaiSlots,
    isAuspiciousForRegistration: dayOfWeek !== 2, // Tuesdays traditionally avoided for deed registration in South India
    propertyBlessingNote: 'Goddess Sri Varahi Amma grants unshakeable title protection & Lord Ganesha clears every registration hurdle.'
  };
}

// Upcoming Auspicious Dates for Land Registration, Bhumi Pooja & Griha Pravesh
export function getUpcomingAuspiciousDates(): AuspiciousDateItem[] {
  const today = new Date();
  const results: AuspiciousDateItem[] = [];

  const types: AuspiciousDateItem['type'][] = [
    'Registration',
    'Agreement / Token',
    'Bhumi Pooja',
    'Griha Pravesh',
    'Registration',
    'Bhumi Pooja'
  ];

  const descriptions = [
    'Sub-Registrar office deed execution with Guru Horai window',
    'Token advance payment and booking agreement signing',
    'Sacred Vastu & foundation stone laying pooja for new villa / plot',
    'House warming ceremony and divine property key handover',
    'Clear title registration with direct Patta transfer blessing',
    'Borewell drilling & agricultural plot boundary consecration'
  ];

  const timings = [
    '09:15 AM - 10:30 AM (Guru Horai)',
    '10:45 AM - 12:00 PM (Sukra Horai)',
    '06:15 AM - 07:30 AM (Brahma Muhurtham)',
    '08:30 AM - 10:00 AM (Amrita Siddha Yoga)',
    '09:00 AM - 10:30 AM (Subha Horai)',
    '06:45 AM - 08:00 AM (Surya / Guru Horai)'
  ];

  for (let i = 1; i <= 6; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (i * 3) + (i % 2 === 0 ? 1 : 0));
    
    // Skip Tuesdays for registration
    if (targetDate.getDay() === 2) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const dateStr = targetDate.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const dayName = targetDate.toLocaleDateString('en-IN', { weekday: 'long' });
    const itemType = types[i - 1];

    results.push({
      date: dateStr,
      day: dayName,
      nakshatra: SAMPLE_NAKSHATRAS[(i * 2) % SAMPLE_NAKSHATRAS.length],
      tithi: SAMPLE_TITHIS[(i * 3) % SAMPLE_TITHIS.length],
      timing: timings[i - 1],
      type: itemType,
      bestFor: descriptions[i - 1],
      auspiciousness: i % 2 === 0 ? 'Golden Muhurtham' : 'Very High'
    });
  }

  return results;
}
