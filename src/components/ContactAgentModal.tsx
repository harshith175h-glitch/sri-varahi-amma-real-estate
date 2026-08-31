import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrencyCode, InquirySubmission, Property, CommunicationProfile } from '../types';
import { formatPrice } from '../utils/currency';

interface ContactAgentModalProps {
  property: Property | null;
  onClose: () => void;
  currency: CurrencyCode;
  onSubmitInquiry: (inquiry: InquirySubmission) => void;
  communicationProfile: CommunicationProfile;
}

type MsgLang = 'English' | 'Tamil' | 'Telugu' | 'Kannada' | 'Hindi';

export const ContactAgentModal: React.FC<ContactAgentModalProps> = ({
  property,
  onClose,
  currency,
  onSubmitInquiry,
  communicationProfile,
}) => {
  if (!property) return null;

  const [tourType, setTourType] = useState<'in-person' | 'video' | 'phone' | 'message'>('in-person');
  const [userName, setUserName] = useState(communicationProfile.name || '');
  const [userEmail, setUserEmail] = useState(communicationProfile.email || '');
  const [userPhone, setUserPhone] = useState(communicationProfile.phone || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [selectedMsgLang, setSelectedMsgLang] = useState<MsgLang>(
    (communicationProfile.primaryLanguage as MsgLang) || 'English'
  );

  const getTemplateMessage = (lang: MsgLang) => {
    switch (lang) {
      case 'Tamil':
        return `வணக்கம் ${property.agent.name}, ${property.city} நகரில் உள்ள "${property.title}" சொத்து குறித்து நான் அறிய விரும்புகிறேன். இதன் முழு விவரங்கள் மற்றும் நேரில்/வீடியோ மூலம் பார்வையிடக்கூடிய நேரத்தை தெரியப்படுத்தவும். (நான் தமிழ் மற்றும் ஆங்கிலத்தில் பேசுகிறேன்).`;
      case 'Telugu':
        return `నమస్కారం ${property.agent.name}, ${property.city} లోని "${property.title}" ప్రాపర్టీ గురించి నేను తెలుసుకోవాలనుకుంటున్నాను. దయచేసి ప్రాపర్టీ బ్రోచర్ మరియు ప్రత్యక్ష/వీడియో సందర్శన సమయాన్ని తెలియజేయండి. (నేను తెలుగు మరియు ఇంగ్లీష్ మాట్లాడతాను).`;
      case 'Kannada':
        return `ನಮಸ್ಕಾರ ${property.agent.name}, ${property.city} ನಲ್ಲಿರುವ "${property.title}" ಆಸ್ತಿಯ ಬಗ್ಗೆ ನಾನು ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಪಡೆಯಲು ಇಚ್ಛಿಸುತ್ತೇನೆ. ದಯವಿಟ್ಟು ಇದರ ವಿವರಗಳು ಮತ್ತು ವೀಕ್ಷಣೆಯ ಸಮಯವನ್ನು ತಿಳಿಸಿ. (ನಾನು ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸಂವಹನ ನಡೆಸಬಲ್ಲೆ).`;
      case 'Hindi':
        return `नमस्ते ${property.agent.name}, मैं ${property.city} में स्थित "${property.title}" प्रॉपर्टी को देखने और इसकी विस्तृत जानकारी प्राप्त करने में रुचि रखता/रखती हूँ। कृपया ब्रोशर और देखने का समय साझा करें। (मैं हिंदी और अंग्रेजी बोलता/बोलती हूँ)।`;
      case 'English':
      default:
        return `Hello ${property.agent.name}, I am interested in viewing "${property.title}" in ${property.city}. Please share the complete property prospectus and let me know your availability for a walkthrough. (Spoken languages: ${communicationProfile.spokenLanguages.join(', ')}).`;
    }
  };

  const [message, setMessage] = useState(getTemplateMessage(selectedMsgLang));
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setMessage(getTemplateMessage(selectedMsgLang));
  }, [selectedMsgLang]);

  // Compute matched languages between user profile and agent
  const matchedLanguages = property.agent.languages.filter((l) =>
    communicationProfile.spokenLanguages.includes(l)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const newInquiry: InquirySubmission = {
      id: `inq-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyCity: property.city,
      propertyPrice: formatPrice(property.priceINR, currency, property.listingType),
      agentName: property.agent.name,
      userName,
      userEmail,
      userPhone,
      userLanguage: selectedMsgLang,
      spokenLanguages: communicationProfile.spokenLanguages,
      tourType,
      preferredDate,
      preferredTime,
      message,
      createdAt: new Date().toISOString(),
    };

    onSubmitInquiry(newInquiry);
    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleWhatsAppDirect = () => {
    const cleanNumber = property.agent.whatsapp.replace(/[^0-9]/g, '');
    const scheduleLine = preferredDate ? `\n📅 *Scheduled Timing:* ${preferredDate} at ${preferredTime}` : '';
    const tourLine = `\n🧭 *Request Type:* ${tourType === 'in-person' ? 'Site Visit / Land Inspection' : 'Direct Call / Info'}`;
    const text = encodeURIComponent(
      `Hello Harshith (Sri Varahi Amma Real Estate),\n\nI am inquiring regarding *${property.title}* located in ${property.city}.\n\n👤 *Buyer Name:* ${userName || 'Interested Buyer'}\n📞 *Buyer Mobile:* ${userPhone || ''}${scheduleLine}${tourLine}\n\n*Message:* ${message || 'Please share more details on this property.'}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          id="btn-close-contact-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header & Agent Profile Preview */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#8C7A65]">Direct Advisor Concierge</span>
                <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">Inquire with Listing Advisor</h3>
                <p className="text-xs font-sans text-[#736B63] mt-0.5">
                  Direct private channel with licensed advisor for brochures & private viewings.
                </p>
              </div>

              {/* Property & Agent Summary Header */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E1DA] space-y-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={property.agent.photo}
                    alt={property.agent.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-[#E5E1DA] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-[#1A1A1A] truncate">{property.agent.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8C7A65] shrink-0" />
                    </div>
                    <p className="text-xs font-sans text-[#736B63] truncate">{property.agent.agency}</p>
                    <p className="text-xs font-serif font-semibold text-[#8C7A65] truncate mt-0.5">
                      {property.title} — {formatPrice(property.priceINR, currency, property.listingType)}
                    </p>
                  </div>
                </div>

                {/* Multilingual Matching Bar */}
                <div className="pt-2 border-t border-[#E5E1DA] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-[#8C7A65]" />
                    <span className="text-[#736B63]">Advisor speaks:</span>
                    <strong className="text-[#1A1A1A]">{property.agent.languages.join(', ')}</strong>
                  </div>

                  {matchedLanguages.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F0EA] text-[#8C7A65] text-[10px] font-bold">
                      ✓ Direct Language Match ({matchedLanguages.join(', ')})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Channels: WhatsApp & Call */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] text-xs font-sans font-semibold transition shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#8C7A65]" />
                <span>Instant WhatsApp</span>
              </button>

              <a
                href={`tel:${property.agent.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] text-xs font-sans font-semibold transition shadow-2xs"
              >
                <Phone className="w-4 h-4 text-[#8C7A65]" />
                <span>Direct Line</span>
              </a>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E5E1DA]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-sans font-bold uppercase tracking-widest text-[#8C7A65]">Or Schedule Private Viewing</span>
              <div className="flex-grow border-t border-[#E5E1DA]"></div>
            </div>

            {/* Tour Type Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A]">Engagement Format:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'in-person', label: 'In-Person Tour', icon: MapPin },
                  { id: 'video', label: 'Video Walkthrough', icon: Video },
                  { id: 'phone', label: 'Phone Consultation', icon: Phone },
                  { id: 'message', label: 'Prospectus Email', icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = tourType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTourType(item.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-sans font-medium gap-1.5 transition ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold shadow-xs'
                          : 'bg-white border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C4A484]' : 'text-[#8C7A65]'}`} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Date & Time if Tour */}
              {(tourType === 'in-person' || tourType === 'video' || tourType === 'phone') && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white border border-[#E5E1DA]">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl p-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      Preferred Slot
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl p-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      <option value="10:00 AM">10:00 AM - Morning</option>
                      <option value="11:30 AM">11:30 AM - Midday</option>
                      <option value="02:00 PM">02:00 PM - Afternoon</option>
                      <option value="04:30 PM">04:30 PM - Evening</option>
                      <option value="06:00 PM">06:00 PM - Sunset Viewing</option>
                    </select>
                  </div>
                </div>
              )}

              {/* User Contact Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#9E978E] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#9E978E] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#9E978E] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    />
                  </div>
                </div>

                {/* Multilingual Message Template Selector */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-[#8C7A65]" />
                      <span>Inquiry Language Draft:</span>
                    </label>
                    <span className="text-[10px] text-[#8C7A65]">Click to translate message</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'English', label: 'English', native: 'English' },
                      { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
                      { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
                      { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
                      { id: 'Hindi', label: 'Hindi', native: 'हिंदी' },
                    ].map((lang) => {
                      const isSelected = selectedMsgLang === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setSelectedMsgLang(lang.id as MsgLang)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            isSelected
                              ? 'bg-[#1A1A1A] text-white font-bold'
                              : 'bg-white border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A]'
                          }`}
                        >
                          <span>{lang.native}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-[#E5E1DA] rounded-xl p-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#9E978E] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                id="btn-submit-agent-inquiry"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-sans font-bold uppercase tracking-widest text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C4A484]" />
                <span>Submit Inquiry to {property.agent.name}</span>
              </button>

            </form>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#F4F0EA] border border-[#E5E1DA] flex items-center justify-center mx-auto text-[#8C7A65]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">Inquiry Successfully Dispatched</h3>
              <p className="text-sm font-sans text-[#736B63] max-w-md mx-auto">
                Thank you <strong className="text-[#1A1A1A]">{userName}</strong>. {property.agent.name} from {property.agent.agency} has received your dossier request regarding <strong className="text-[#1A1A1A]">{property.title}</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E5E1DA] max-w-md mx-auto text-left text-xs font-sans space-y-2.5">
              <div className="flex justify-between text-[#736B63]">
                <span>Engagement:</span>
                <strong className="text-[#1A1A1A] capitalize">{tourType} Tour</strong>
              </div>
              {preferredDate && (
                <div className="flex justify-between text-[#736B63]">
                  <span>Scheduled Date:</span>
                  <strong className="text-[#1A1A1A]">{preferredDate} at {preferredTime}</strong>
                </div>
              )}
              <div className="flex justify-between text-[#736B63]">
                <span>Communication Language:</span>
                <strong className="text-[#1A1A1A]">{selectedMsgLang} ({communicationProfile.spokenLanguages.join(', ')})</strong>
              </div>
              <div className="flex justify-between text-[#736B63]">
                <span>Advisor Contact:</span>
                <strong className="text-[#8C7A65]">{property.agent.phone}</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleWhatsAppDirect}
                className="px-5 py-2.5 rounded-full bg-[#FCFAF7] hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#1A1A1A] text-xs font-sans font-semibold flex items-center gap-2 shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#8C7A65]" />
                <span>Open in WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs uppercase tracking-wider font-sans font-bold"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
