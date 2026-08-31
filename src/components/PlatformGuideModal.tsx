import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Globe, 
  DollarSign, 
  Calculator, 
  Scale, 
  UserCheck, 
  Plus, 
  Heart, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenListProperty: () => void;
  onOpenMortgage: () => void;
  onOpenAgents: () => void;
  onOpenProfile: () => void;
}

type GuideLanguage = 'en' | 'ta' | 'te' | 'kn' | 'hi';

const TRANSLATIONS = {
  en: {
    langName: 'English',
    nativeName: 'English',
    badge: 'Comprehensive Platform Overview',
    title: 'How TerraGlobal Helps You',
    subtitle: 'Your all-in-one gateway for Indian and international luxury real estate, dual-currency valuation, and multilingual advisory.',
    featuresHeader: '8 Powerful Ways TerraGlobal Empowers You',
    personasHeader: 'Tailored Solutions by Role',
    features: [
      {
        icon: Globe,
        title: '1. Dual Market Gateway (India & Global Hubs)',
        desc: 'Explore luxury properties seamlessly across prime Indian cities (Mumbai, Bengaluru, Goa, Delhi NCR, Hyderabad) and international capitals (Dubai, London, New York, Singapore, Bali) in a unified interface.',
      },
      {
        icon: Plus,
        title: '2. List Your Property & Set Custom Asking Prices',
        desc: 'Owners, NRI landlords, and brokers can directly publish property listings with custom pricing in any currency (INR, USD, AED, GBP, EUR), upload custom photography, specify BHK configurations, and assign local advisors.',
      },
      {
        icon: DollarSign,
        title: '3. Instant Multi-Currency Switcher & Real-Time FX',
        desc: 'Switch effortlessly between Indian Rupees (₹ Lakhs & Crores), US Dollars ($), UAE Dirhams (AED), British Pounds (£), and Euros (€) with automatic live exchange rates for transparent cross-border valuation.',
      },
      {
        icon: UserCheck,
        title: '4. Multilingual Advisor Matching (5+ Indian & Global Languages)',
        desc: 'Connect with verified real estate advisors fluent in English, Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Hindi (हिंदी), and international languages to communicate comfortably without language barriers.',
      },
      {
        icon: Calculator,
        title: '5. Mortgage & Home Loan EMI Financial Modeler',
        desc: 'Calculate down payments, monthly EMI installments, amortization schedules, and interest breakdowns for both Indian bank loans (SBI/HDFC rates) and foreign overseas financing.',
      },
      {
        icon: Scale,
        title: '6. Side-by-Side Property Comparison Matrix',
        desc: 'Compare up to 4 properties simultaneously across asking price, square footage rate, BHK layout, furnishing status, RERA legal approvals, and listing agents.',
      },
      {
        icon: Heart,
        title: '7. Private Portfolio & Saved Properties Drawer',
        desc: 'Bookmark and curate your favorite residences into a private local portfolio. Quickly review specs, share with family, or request property prospectuses.',
      },
      {
        icon: MessageCircle,
        title: '8. Direct WhatsApp & In-Person/Video Tour Concierge',
        desc: 'Initiate direct WhatsApp chats with listing advisors with pre-filled property details or schedule in-person tours, live video walkthroughs, and prospectus requests.',
      },
    ],
    personas: [
      {
        role: 'For Homebuyers & NRI Investors',
        points: [
          'Find RERA-verified luxury properties with verified ownership titles',
          'Evaluate real-time foreign exchange rates for remitting funds',
          'Chat with advisors who speak your native language (Tamil, Telugu, Kannada, Hindi)',
        ],
      },
      {
        role: 'For Property Owners & Sellers',
        points: [
          'Set your own asking price and target global high-net-worth buyers',
          'Showcase your property with multi-currency pricing to international expats',
          'Receive direct buyer inquiries with contact information and preferred tour times',
        ],
      },
      {
        role: 'For Real Estate Advisors & Agencies',
        points: [
          'Showcase your licensed credentials, client reviews, and language proficiencies',
          'Receive structured buyer leads with specific tour format preferences',
          'Connect with active investors through direct WhatsApp and phone channels',
        ],
      },
    ],
    quickCta: 'Explore Features Now',
  },

  ta: {
    langName: 'Tamil',
    nativeName: 'தமிழ்',
    badge: 'தளத்தின் முழுமையான விளக்கம்',
    title: 'டெர்ராக்ளோபல் (TerraGlobal) உங்களுக்கு எவ்வாறு உதவுகிறது?',
    subtitle: 'இந்திய மற்றும் சர்வதேச சொகுசு ரியல் எஸ்டேட், இரட்டை நாணய விலை நிர்ணயம் மற்றும் பலமொழி ஆலோசனைக்கான ஒரே தளம்.',
    featuresHeader: 'டெர்ராக்ளோபல் வழங்கும் 8 முக்கிய நன்மைகள்',
    personasHeader: 'பயனாளர்களுக்கான சிறப்பு வசதிகள்',
    features: [
      {
        icon: Globe,
        title: '1. இந்தியா & சர்வதேச சொத்துக்களின் தொகுப்பு',
        desc: 'மும்பை, பெங்களூரு, கோவா, டெல்லி, ஹைதராபாத் மற்றும் துபாய், லண்டன், நியூயார்க், சிங்கப்பூர், பாலி போன்ற உலகளாவிய நகரங்களின் சொத்துக்களை ஒரே இடத்தில் பார்க்கலாம்.',
      },
      {
        icon: Plus,
        title: '2. உங்கள் சொத்தை பட்டியலிட்டு நீங்கள் விரும்பும் விலையை நிர்ணயிக்கலாம்',
        desc: 'உரிமையாளர்கள் தங்கள் சொத்துக்களை தாங்களே நிர்ணயிக்கும் விலையில் (ரூபாய், டாலர், திர்ஹாம், பவுண்ட்) எளிதாக பட்டியலிடலாம்.',
      },
      {
        icon: DollarSign,
        title: '3. உடனடி நாணய மாற்றி (INR, USD, AED, GBP, EUR)',
        desc: 'இந்திய ரூபாய் (லட்சம்/கோடி) மற்றும் உலக நாணயங்களில் நேரடி மாற்று விகிதங்களுடன் விலையை உடனுக்குடன் துல்லியமாக பார்க்கலாம்.',
      },
      {
        icon: UserCheck,
        title: '4. தமிழ், தெலுங்கு, கன்னடம், இந்தி, ஆங்கிலத்தில் ஆலோசனை',
        desc: 'உங்களுக்கு வசதியான மொழியில் (தமிழ், ஆங்கிலம், கன்னடம், தெலுங்கு, இந்தி) பேசக்கூடிய சரிபார்க்கப்பட்ட ரியல் எஸ்டேட் ஆலோசகர்களுடன் நேரடியாக தொடர்பு கொள்ளலாம்.',
      },
      {
        icon: Calculator,
        title: '5. வீட்டுக் கடன் மற்றும் EMI கால்குலேட்டர்',
        desc: 'இந்திய வங்கிகள் மற்றும் சர்வதேச கடன்களுக்கான மாதத் தவணை (EMI), வட்டித் தொகை, முன்பணம் ஆகியவற்றை துல்லியமாக கணக்கிடலாம்.',
      },
      {
        icon: Scale,
        title: '6. சொத்துக்களை அருகருகே ஒப்பிடும் வசதி (Comparison Matrix)',
        desc: 'ஒரே நேரத்தில் 4 சொத்துக்களின் சதுர அடி விலை, படுக்கையறைகள், ரெரா (RERA) சான்றிதழ் போன்றவற்றை ஒப்பிட்டுப் பார்க்கலாம்.',
      },
      {
        icon: Heart,
        title: '7. விருப்பமான சொத்துக்களை சேமிக்கும் தனி போர்ட்ஃபோலியோ',
        desc: 'உங்களுக்குப் பிடித்த வீடுகளை புக்மார்க் செய்து உங்கள் தனிப்பட்ட போர்ட்ஃபோலியோவில் பாதுகாத்து வைக்கலாம்.',
      },
      {
        icon: MessageCircle,
        title: '8. உடனடி வாட்ஸ்அப் (WhatsApp) & நேரில்/வீடியோ பார்வையிடல்',
        desc: 'ஆலோசகருடன் ஒரே கிளிக்கில் வாட்ஸ்அப்பில் பேசலாம், அல்லது நேரில்/வீடியோ மூலம் சொத்தைப் பார்வையிட முன்பதிவு செய்யலாம்.',
      },
    ],
    personas: [
      {
        role: 'வீடு வாங்குபவர்கள் மற்றும் NRI முதலீட்டாளர்களுக்கு',
        points: [
          'ரெரா சரிபார்க்கப்பட்ட சட்டபூர்வ சொத்துக்களைத் தேர்ந்தெடுங்கள்',
          'உங்கள் தாய்மொழியில் (தமிழில்) ஆலோசகரிடம் பேசி விவரங்களை அறியலாம்',
          'நேரடி நாணய மாற்று மூலம் முதலீட்டு செலவுகளை திட்டமிடுங்கள்',
        ],
      },
      {
        role: 'சொத்து உரிமையாளர்கள் மற்றும் விற்பனையாளர்களுக்கு',
        points: [
          'உங்கள் விருப்பப்படி விற்பனை விலையை நிர்ணயித்து பட்டியலிடுங்கள்',
          'உலகளாவிய வாங்குபவர்களை எளிதாக சென்றடையுங்கள்',
        ],
      },
    ],
    quickCta: 'பயன்படுத்தத் தொடங்குங்கள்',
  },

  te: {
    langName: 'Telugu',
    nativeName: 'తెలుగు',
    badge: 'ప్లాట్‌ఫారమ్ పూర్తి వివరాలు',
    title: 'టెర్రాగ్లోబల్ (TerraGlobal) మీకు ఎలా సహాయపడుతుంది?',
    subtitle: 'భారతీయ మరియు అంతర్జాతీయ లగ్జరీ రియల్ ఎస్టేట్, కరెన్సీ కన్వర్టర్ మరియు బహుభాషా సంప్రదింపుల కోసం సంపూర్ణ వేదిక.',
    featuresHeader: 'టెర్రాగ్లోబల్ అందించే 8 ముఖ్యమైన ప్రయోజనాలు',
    personasHeader: 'వివిధ వినియోగదారులకు ప్రయోజనాలు',
    features: [
      {
        icon: Globe,
        title: '1. భారతదేశం మరియు అంతర్జాతీయ ప్రాపర్టీలు',
        desc: 'హైదరాబాద్, బెంగళూరు, ముంబై, ఢిల్లీలతో పాటు దుబాయ్, లండన్, న్యూయార్క్, సింగపూర్ వంటి ప్రపంచ నగరాల ప్రాపర్టీలను ఒకే చోట చూడవచ్చు.',
      },
      {
        icon: Plus,
        title: '2. మీ ప్రాపర్టీని లిస్ట్ చేసి స్వంత ధర నిర్ణయించండి',
        desc: 'యజమానులు మరియు ఎన్నారైలు తమ ప్రాపర్టీలను తమకు నచ్చిన కరెన్సీ మరియు ధరతో నేరుగా లిస్ట్ చేయవచ్చు.',
      },
      {
        icon: DollarSign,
        title: '3. తక్షణ కరెన్సీ కన్వర్టర్ (INR, USD, AED, GBP)',
        desc: 'రూపాయలు (లక్షలు/కోట్లు), డాలర్లు, దిర్హామ్‌లలో నిజ సమయ మారకపు రేట్లతో ధరలను తక్షణమే తెలుసుకోవచ్చు.',
      },
      {
        icon: UserCheck,
        title: '4. తెలుగు, ఇంగ్లీష్, హిందీ, కన్నడ, తమిళంలో అడ్వైజర్లు',
        desc: 'మీరు మాట్లాడే భాషలో (తెలుగు, ఇంగ్లీష్, హిందీ మొదలైనవి) మాట్లాడే సర్టిఫైడ్ రియల్ ఎస్టేట్ అడ్వైజర్లతో నేరుగా మాట్లాడవచ్చు.',
      },
      {
        icon: Calculator,
        title: '5. హోమ్ లోన్ EMI మరియు తనఖా కాలిక్యులేటర్',
        desc: 'డౌన్ పేమెంట్, వడ్డీ రేటు, నెలవారీ EMIని సులభంగా మరియు ఖచ్చితంగా లెక్కించండి.',
      },
      {
        icon: Scale,
        title: '6. ప్రాపర్టీ పోలిక ఫీచర్ (Comparison Matrix)',
        desc: 'ఒకేసారి 4 ప్రాపర్టీల ధర, విస్తీర్ణం, చదరపు అడుగుల రేటు, RERA ధృవీకరణలను పక్కపక్కనే పోల్చి చూడండి.',
      },
      {
        icon: Heart,
        title: '7. ఇష్టమైన ప్రాపర్టీల ప్రైవేట్ పోర్ట్‌ఫోలియో',
        desc: 'మీకు నచ్చిన ఇళ్లను సేవ్ చేసుకొని కుటుంబ సభ్యులతో పంచుకోవచ్చు.',
      },
      {
        icon: MessageCircle,
        title: '8. డైరెక్ట్ వాట్సాప్ & వీడియో/ప్రత్యక్ష టూర్లు',
        desc: 'అడ్వైజర్‌తో నేరుగా వాట్సాప్‌లో మాట్లాడవచ్చు లేదా వీడియో టూర్ కోసం బుక్ చేసుకోవచ్చు.',
      },
    ],
    personas: [
      {
        role: 'కొనుగోలుదారులు మరియు ఎన్నారై (NRI) ఇన్వెస్టర్లకు',
        points: [
          'లీగల్ మరియు RERA సర్టిఫైడ్ ప్రాపర్టీల ఎంపిక',
          'మీ మాతృభాష అయిన తెలుగులో మాట్లాడే అడ్వైజర్ల సలహాలు',
          'ఖచ్చితమైన EMI మరియు ఫైనాన్షియల్ ప్లానింగ్',
        ],
      },
      {
        role: 'ప్రాపర్టీ యజమానులకు',
        points: [
          'మీకు నచ్చిన ధరను నిర్ణయించి గ్లోబల్ కొనుగోలుదారులను ఆకర్షించండి',
        ],
      },
    ],
    quickCta: 'ఇప్పుడే ప్రారంభించండి',
  },

  kn: {
    langName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    badge: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸಮಗ್ರ ಮಾರ್ಗದರ್ಶಿ',
    title: 'ಟೆರ್ರಾಗ್ಲೋಬಲ್ (TerraGlobal) ನಿಮಗೆ ಹೇಗೆ ಸಹಕಾರಿಯಾಗಿದೆ?',
    subtitle: 'ಭಾರತೀಯ ಮತ್ತು ಅಂತರರಾಷ್ಟ್ರೀಯ ಐಷಾರಾಮಿ ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಕರೆನ್ಸಿ ಪರಿವರ್ತನೆ ಮತ್ತು ಬಹುಭಾಷಾ ಸಮಾಲೋಚನೆಗೆ ಪ್ರಮುಖ ವೇದಿಕೆ.',
    featuresHeader: 'ಟೆರ್ರಾಗ್ಲೋಬಲ್ ಒದಗಿಸುವ 8 ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು',
    personasHeader: 'ವಿವಿಧ ಬಳಕೆದಾರರಿಗೆ ಅನುಕೂಲಗಳು',
    features: [
      {
        icon: Globe,
        title: '1. ಭಾರತ ಮತ್ತು ಜಾಗತಿಕ ಮಾರುಕಟ್ಟೆಗಳು',
        desc: 'ಬೆಂಗಳೂರು, ಮುಂಬೈ, ಗೋವಾ, ದೆಹಲಿ ಹಾಗೂ ದುಬೈ, ಲಂಡನ್, ಸಿಂಗಾಪುರ, ನ್ಯೂಯಾರ್ಕ್ ನಗರಗಳ ಐಷಾರಾಮಿ ಮನೆಗಳು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ಲಭ್ಯ.',
      },
      {
        icon: Plus,
        title: '2. ನಿಮ್ಮ ಆಸ್ತಿಯನ್ನು ಪಟ್ಟಿ ಮಾಡಿ ಮತ್ತು ಸ್ವಂತ ಬೆಲೆ ನಿಗದಿಪಡಿಸಿ',
        desc: 'ಮಾಲೀಕರು ತಮ್ಮ ಆಸ್ತಿಯನ್ನು ತಮಗೆ ಇಷ್ಟವಾದ ಬೆಲೆ ಮತ್ತು ಕರೆನ್ಸಿಯಲ್ಲಿ ಸುಲಭವಾಗಿ ಪಟ್ಟಿ ಮಾಡಬಹುದು.',
      },
      {
        icon: DollarSign,
        title: '3. ತಕ್ಷಣದ ಕರೆನ್ಸಿ ಪರಿವರ್ತಕ (INR, USD, AED, GBP)',
        desc: 'ಭಾರತೀಯ ರೂಪಾಯಿ (ಲಕ್ಷ/ಕೋಟಿ), ಡಾಲರ್ ಮತ್ತು ಇತರ ಕರೆನ್ಸಿಗಳಲ್ಲಿ ಲೈವ್ ದರಗಳೊಂದಿಗೆ ಬೆಲೆಯನ್ನು ವೀಕ್ಷಿಸಿ.',
      },
      {
        icon: UserCheck,
        title: '4. ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ತಮಿಳು, ತೆಲುಗು ಭಾಷಾ ಸಲಹೆಗಾರರು',
        desc: 'ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಭಾಷೆಯಲ್ಲೇ (ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಇತ್ಯಾದಿ) ಸಂವಹನ ನಡೆಸಬಲ್ಲ ಅನುಭವಿ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಅಡ್ವೈಸರ್‌ಗಳ ಜೊತೆ ಮಾತನಾಡಿ.',
      },
      {
        icon: Calculator,
        title: '5. ಗೃಹ ಸಾಲ ಮತ್ತು EMI ಕ್ಯಾಲ್ಕುಲೇಟರ್',
        desc: 'ಮಾಸಿಕ ಕಂತು (EMI), ಡೌನ್‌ಪೇಮೆಂಟ್ ಮತ್ತು ಬಡ್ಡಿದರವನ್ನು ನಿಖರವಾಗಿ ಲೆಕ್ಕ ಹಾಕಿ.',
      },
      {
        icon: Scale,
        title: '6. ಆಸ್ತಿಗಳ ಮುಖಾಮುಖಿ ಹೋಲಿಕೆ (Comparison Matrix)',
        desc: 'ಒಂದೇ ಬಾರಿಗೆ 4 ಆಸ್ತಿಗಳ ಚದರ ಅಡಿ ಬೆಲೆ, ಕೊಠಡಿಗಳು, RERA ಪ್ರಮಾಣೀಕರಣಗಳನ್ನು ಹೋಲಿಸಿ ನೋಡಿ.',
      },
      {
        icon: Heart,
        title: '7. ಮೆಚ್ಚಿನ ಆಸ್ತಿಗಳ ವೈಯಕ್ತಿಕ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ',
        desc: 'ನಿಮಗೆ ಇಷ್ಟವಾದ ಮನೆಗಳನ್ನು ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿ ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.',
      },
      {
        icon: MessageCircle,
        title: '8. ನೇರ ವಾಟ್ಸಾಪ್ (WhatsApp) & ವೀಡಿಯೊ ವೀಕ್ಷಣೆ',
        desc: 'ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಕಳುಹಿಸಿ ಅಥವಾ ವೀಡಿಯೊ ವಾಕ್‌ಥ್ರೂ ಬುಕ್ ಮಾಡಿ.',
      },
    ],
    personas: [
      {
        role: 'ಖರೀದಿದಾರರು ಮತ್ತು NRI ಹೂಡಿಕೆದಾರರಿಗೆ',
        points: [
          'RERA ದೃಢೀಕೃತ ವಿಶ್ವಾಸಾರ್ಹ ಆಸ್ತಿಗಳ ಪಟ್ಟಿ',
          'ಕನ್ನಡ ಮತ್ತು ಇತರ ಭಾಷೆಗಳಲ್ಲಿ ಸುಲಭ ಸಂವಹನ',
          'ನಿಖರ ಹಣಕಾಸು ಮತ್ತು ಸಾಲದ ಯೋಜನೆ',
        ],
      },
      {
        role: 'ಆಸ್ತಿ ಮಾಲೀಕರಿಗೆ',
        points: [
          'ನಿಮ್ಮ ಆಸ್ತಿಗೆ ಸೂಕ್ತ ಬೆಲೆ ನಿಗದಿಪಡಿಸಿ ಜಾಗತಿಕ ಖರೀದಿದಾರರನ್ನು ತಲುಪಿ',
        ],
      },
    ],
    quickCta: 'ಈಗಲೇ ಪ್ರಾರಂಭಿಸಿ',
  },

  hi: {
    langName: 'Hindi',
    nativeName: 'हिंदी',
    badge: 'प्लेटफ़ॉर्म का विस्तृत विवरण',
    title: 'टेराग्लोबल (TerraGlobal) आपकी कैसे मदद करता है?',
    subtitle: 'भारतीय और अंतरराष्ट्रीय लक्जरी रियल एस्टेट, दोहरी मुद्रा मूल्यांकन और बहुभाषी सलाहकार नेटवर्क का संपूर्ण समाधान।',
    featuresHeader: 'टेराग्लोबल के 8 शक्तिशाली फ़ीचर्स',
    personasHeader: 'उपयोगकर्ताओं के लिए प्रमुख लाभ',
    features: [
      {
        icon: Globe,
        title: '1. भारत और वैश्विक रियल एस्टेट का विशाल संग्रह',
        desc: 'मुंबई, बेंगलुरु, गोवा, दिल्ली एनसीआर, हैदराबाद के साथ-साथ दुबई, लंदन, न्यूयॉर्क, सिंगापुर और बाली की प्रीमियम संपत्तियां एक ही स्थान पर उपलब्ध हैं।',
      },
      {
        icon: Plus,
        title: '2. अपनी प्रॉपर्टी लिस्ट करें और मनचाही कीमत तय करें',
        desc: 'मकान मालिक और एनआरआई विक्रेता अपनी प्रॉपर्टी को अपनी पसंद की करेंसी (रुपये, डॉलर, दिरहम आदि) और कस्टम कीमत पर सीधे लिस्ट कर सकते हैं।',
      },
      {
        icon: DollarSign,
        title: '3. इंस्टेंट मल्टी-करेंसी कन्वर्टर (INR, USD, AED, GBP, EUR)',
        desc: 'भारतीय रुपये (लाख/करोड़), अमेरिकी डॉलर, यूएई दिरहम में रियल-टाइम लाइव विनिमय दरों के साथ सटीक कीमत देखें।',
      },
      {
        icon: UserCheck,
        title: '4. हिंदी, तमिल, तेलुगु, कन्नड़ और अंग्रेजी में सलाहकार',
        desc: 'अपनी सुविधाजनक भाषा (हिंदी, अंग्रेजी, तमिल, तेलुगु, कन्नड़) में बात करने वाले लाइसेंस प्राप्त रियल एस्टेट सलाहकारों से सीधे जुड़ें।',
      },
      {
        icon: Calculator,
        title: '5. होम लोन ईएमआई (EMI) और मॉर्गेज कैलकुलेटर',
        desc: 'भारतीय बैंकों और विदेशी संपत्तियों के लिए डाउन पेमेंट, लोन अवधि, ब्याज और मासिक ईएमआई का सटीक विश्लेषण करें।',
      },
      {
        icon: Scale,
        title: '6. प्रॉपर्टी तुलना मैट्रिक्स (Side-by-Side Comparison)',
        desc: 'एक साथ 4 संपत्तियों की प्रति वर्ग फुट कीमत, आकार, बेडरूम, रेरा (RERA) लीगल स्टेटस की तुलना करें।',
      },
      {
        icon: Heart,
        title: '7. पसंदीदा संपत्तियों का प्राइवेट पोर्टफोलियो',
        desc: 'अपनी मनपसंद संपत्तियों को निजी वॉचलिस्ट में सहेजें और परिवार के साथ साझा करें।',
      },
      {
        icon: MessageCircle,
        title: '8. डायरेक्ट व्हाट्सएप (WhatsApp) और इन-पर्सन/वीडियो टूर',
        desc: 'एक क्लिक में व्हाट्सएप पर चैट करें, या व्यक्तिगत रूप से मिलने या लाइव वीडियो वॉकथ्रू का समय तय करें।',
      },
    ],
    personas: [
      {
        role: 'खरीदारों और एनआरआई (NRI) निवेशकों के लिए',
        points: [
          'रेरा प्रमाणित व कानूनी रूप से सुरक्षित संपत्तियों की खोज',
          'अपनी मातृभाषा (हिंदी, तमिल, तेलुगु, आदि) में सलाहकारों से संवाद',
          'सटीक ईएमआई और मुद्रा विनिमय गणना',
        ],
      },
      {
        role: 'प्रॉपर्टी मालिकों और विक्रेताओं के लिए',
        points: [
          'अपनी खुद की कीमत निर्धारित करें और अंतरराष्ट्रीय खरीदारों तक पहुंचें',
        ],
      },
    ],
    quickCta: 'अभी शुरू करें',
  },
};

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenListProperty,
  onOpenMortgage,
  onOpenAgents,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  const [activeLang, setActiveLang] = useState<GuideLanguage>('en');
  const t = TRANSLATIONS[activeLang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">
                {t.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">
                {t.title}
              </h3>
            </div>
          </div>

          <button
            id="btn-close-platform-guide"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multilingual Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-[#E5E1DA] rounded-2xl">
          <span className="text-xs text-[#8C7A65] font-bold px-3 uppercase tracking-wider">
            Language / மொழி / భాష / ಭಾಷೆ:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['en', 'ta', 'te', 'kn', 'hi'] as GuideLanguage[]).map((langKey) => {
              const info = TRANSLATIONS[langKey];
              const isSelected = activeLang === langKey;
              return (
                <button
                  key={langKey}
                  onClick={() => setActiveLang(langKey)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white font-bold shadow-xs'
                      : 'bg-[#FCFAF7] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="font-semibold">{info.nativeName}</span>
                  {langKey !== 'en' && <span className="opacity-70 text-[10px] ml-1">({info.langName})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Subtitle */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#8C7A65]">
            <Compass className="w-4 h-4" />
            <span>Platform Capabilities</span>
          </div>
          <p className="text-sm font-serif text-[#1A1A1A] leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 8 Powerful Features Grid */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C7A65]" />
            <span>{t.featuresHeader}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {t.features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[#E5E1DA] hover:border-[#8C7A65] transition shadow-2xs space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h5 className="font-serif font-bold text-sm text-[#1A1A1A]">{feat.title}</h5>
                  </div>
                  <p className="text-xs text-[#736B63] leading-relaxed pl-10">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personas Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif font-bold text-lg text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8C7A65]" />
            <span>{t.personasHeader}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {t.personas.map((persona, idx) => (
              <div key={idx} className="p-4.5 rounded-2xl bg-white border border-[#E5E1DA] space-y-2.5">
                <h5 className="font-serif font-bold text-sm text-[#1A1A1A] border-b border-[#E5E1DA] pb-2">
                  {persona.role}
                </h5>
                <ul className="space-y-1.5 text-xs text-[#736B63]">
                  {persona.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8C7A65] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons to Launch Key Tools */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] space-y-3 text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A65]">
            Quick Access Tools
          </span>
          
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              🗣️ Set Language Profile (EN, TA, TE, KN, HI)
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenListProperty();
              }}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] text-xs font-semibold transition shadow-2xs"
            >
              + List Property & Custom Price
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenMortgage();
              }}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] text-xs font-semibold transition shadow-2xs"
            >
              Loan & EMI Calculator
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAgents();
              }}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] text-xs font-semibold transition shadow-2xs"
            >
              Verified Advisors Directory
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#E5E1DA]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition"
          >
            {t.quickCta}
          </button>
        </div>

      </div>
    </div>
  );
};
