import React, { useState } from 'react';
import { 
  X, 
  Languages, 
  Check, 
  MessageCircle, 
  Phone, 
  Mail, 
  Video, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { CommunicationProfile } from '../types';

interface CommunicationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CommunicationProfile;
  onSaveProfile: (profile: CommunicationProfile) => void;
}

const AVAILABLE_LANGUAGES = [
  { id: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { id: 'Hindi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { id: 'Marathi', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { id: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { id: 'Arabic', label: 'Arabic', native: 'العربية', flag: '🇦🇪' },
  { id: 'French', label: 'French', native: 'Français', flag: '🇫🇷' },
];

export const CommunicationProfileModal: React.FC<CommunicationProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<CommunicationProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleLanguage = (lang: string) => {
    const exists = formData.spokenLanguages.includes(lang);
    let updated: string[];
    if (exists) {
      // Don't allow removing all languages
      if (formData.spokenLanguages.length === 1) return;
      updated = formData.spokenLanguages.filter((l) => l !== lang);
    } else {
      updated = [...formData.spokenLanguages, lang];
    }
    
    // If primary language was removed, set to first available
    let primary = formData.primaryLanguage;
    if (!updated.includes(primary)) {
      primary = updated[0] || 'English';
    }

    setFormData({
      ...formData,
      spokenLanguages: updated,
      primaryLanguage: primary,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">
                Buyer & Investor Preferences
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">
                Communication Profile & Languages
              </h3>
              <p className="text-xs font-sans text-[#736B63]">
                Configure your spoken languages (English, Tamil, Telugu, Kannada, Hindi) & contact preferences
              </p>
            </div>
          </div>

          <button
            id="btn-close-comm-profile"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Explanatory Banner */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E1DA] flex items-start gap-3 shadow-2xs">
          <Sparkles className="w-5 h-5 text-[#8C7A65] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Seamless Multilingual Advisory</h4>
            <p className="text-[#736B63] leading-relaxed">
              When you contact property advisors or request viewings across India and foreign hubs, this profile automatically informs them of your language proficiencies (such as <strong>English, Tamil, Telugu, Kannada, Hindi</strong>) and preferred channels for smooth conversation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Languages Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#8C7A65]" />
                <span>Languages You Speak & Understand *</span>
              </label>
              <span className="text-[11px] text-[#8C7A65] font-medium">
                {formData.spokenLanguages.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = formData.spokenLanguages.includes(lang.id);
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => toggleLanguage(lang.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold shadow-xs'
                        : 'bg-white border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] hover:border-[#8C7A65]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-left truncate">
                      <span className="text-base">{lang.flag}</span>
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">{lang.label}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-[#C4A484]' : 'text-[#8C7A65]'}`}>
                          {lang.native}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#C4A484] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Language & Preferred Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A] block mb-1.5">
                Primary Language for Inquiries
              </label>
              <select
                value={formData.primaryLanguage}
                onChange={(e) => setFormData({ ...formData, primaryLanguage: e.target.value })}
                className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              >
                {formData.spokenLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A] block mb-1.5">
                Investor / Buyer Persona
              </label>
              <select
                value={formData.investorType}
                onChange={(e) => setFormData({ ...formData, investorType: e.target.value as any })}
                className="w-full bg-white border border-[#E5E1DA] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              >
                <option value="luxury_buyer">Luxury Homebuyer / Resident</option>
                <option value="nri">Non-Resident Indian (NRI) Investor</option>
                <option value="investor">Cross-Border Real Estate Investor</option>
                <option value="first_time">First-Time Premium Buyer</option>
                <option value="seller">Property Owner / Seller</option>
              </select>
            </div>
          </div>

          {/* Preferred Channel & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A] block mb-1.5">
                Preferred Engagement Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                  { id: 'call', label: 'Direct Call', icon: Phone },
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'video', label: 'Video Tour', icon: Video },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.preferredChannel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredChannel: item.id as any })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                          : 'bg-white border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C4A484]' : 'text-[#8C7A65]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-bold text-[#1A1A1A] block mb-1.5">
                Preferred Contact Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'morning', label: 'Morning (9am - 12pm)' },
                  { id: 'afternoon', label: 'Afternoon (12pm - 4pm)' },
                  { id: 'evening', label: 'Evening (4pm - 8pm)' },
                  { id: 'anytime', label: 'Anytime Convenient' },
                ].map((slot) => {
                  const isSelected = formData.preferredTimeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredTimeSlot: slot.id as any })}
                      className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                          : 'bg-white border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A]'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C4A484]' : 'text-[#8C7A65]'}`} />
                      <span className="truncate">{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Details to Auto-Fill */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E1DA] space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#8C7A65]" />
              <span>Contact Information (Auto-filled on Inquiries)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A65] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Harshith"
                  className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A65] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. harshith@example.com"
                  className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A65] block mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A65] block mb-1">
                Special Language / Advisory Notes for Agents
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. I speak English, Tamil, Telugu, Kannada, and Hindi. Prefer communications via WhatsApp."
                className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E1DA]">
            <div className="flex items-center gap-1.5 text-xs text-[#8C7A65]">
              <ShieldCheck className="w-4 h-4" />
              <span>Saved locally to your browser</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-xs font-semibold text-[#736B63] hover:text-[#1A1A1A] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-save-communication-profile"
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-widest shadow-md transition flex items-center gap-2"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C4A484]" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
