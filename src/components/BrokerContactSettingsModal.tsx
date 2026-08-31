import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  X, 
  Save, 
  Globe, 
  Clock, 
  Sparkles,
  Upload,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { saveDeityImage, clearDeityImage } from '../utils/imageStorage';
import { DEFAULT_DEITY_PHOTO_URL } from '../data/deityAsset';

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
    'National & International NRI Deals'
  ],
  operatingHours: 'Monday - Sunday: 8:00 AM - 9:00 PM IST (Direct Phone & WhatsApp)',
  googleRating: '4.9 ★ (150+ Verified Land Closings)',
  totalDealsClosed: '300+ Verified Land & Property Parcels Handled',
  deityImageUrl: undefined,
};

interface BrokerContactSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BrokerContactConfig;
  onSaveConfig: (newConfig: BrokerContactConfig) => void;
}

export const BrokerContactSettingsModal: React.FC<BrokerContactSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<BrokerContactConfig>(config);
  const [locationInput, setLocationInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleDeityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        
        // Auto-compress large photos so localStorage never hits quota limits
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.88);
            setFormData(prev => ({ ...prev, deityImageUrl: compressed }));
            saveDeityImage(compressed);
          } else {
            setFormData(prev => ({ ...prev, deityImageUrl: rawDataUrl }));
            saveDeityImage(rawDataUrl);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    if (formData.deityImageUrl) {
      saveDeityImage(formData.deityImageUrl);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleAddLocation = () => {
    if (locationInput.trim() && !formData.primaryLocations.includes(locationInput.trim())) {
      setFormData({
        ...formData,
        primaryLocations: [...formData.primaryLocations, locationInput.trim()],
      });
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setFormData({
      ...formData,
      primaryLocations: formData.primaryLocations.filter(loc => loc !== locToRemove),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white px-6 py-5 border-b border-[#E5E1DA] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#C4A484] shadow-xs">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A]">Admin Business & Website Settings</h2>
              <p className="text-xs text-[#8C7A65]">Private Owner Console • Contact Numbers, Office Address & Deity Photos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#736B63] hover:text-[#1A1A1A] hover:bg-[#F4F0EA] rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-sm">
          
          <div className="p-3.5 rounded-xl bg-[#F4F0EA] border border-[#E5E1DA] flex items-center gap-3 text-xs text-[#736B63]">
            <Sparkles className="w-4 h-4 text-[#C4A484] shrink-0" />
            <span>
              All settings here are protected. Public customers viewing the website cannot edit or change photos.
            </span>
          </div>

          {/* Admin Deity Photo Management */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E1DA] space-y-3">
            <label className="block text-xs font-bold text-[#1A1A1A] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#8C7A65]" />
                <span>Deity Blessing Image (Sri Varahi Amma & Lord Ganesha)</span>
              </span>
              <span className="text-[11px] text-[#8C7A65] font-normal">Private Admin Control</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-xl bg-[#171513] border border-[#D4AF37]/50 overflow-hidden flex items-center justify-center shrink-0">
                {formData.deityImageUrl || localStorage.getItem('varahi_custom_deity_art') ? (
                  <img 
                    src={formData.deityImageUrl || localStorage.getItem('varahi_custom_deity_art') || ''} 
                    alt="Current Deity" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-[10px] text-[#D4AF37] font-serif text-center px-1">Default Artwork</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Upload Device Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleDeityUpload} 
                      className="hidden" 
                    />
                  </label>
                  
                  {formData.deityImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, deityImageUrl: undefined }));
                        clearDeityImage();
                      }}
                      className="px-3 py-2 rounded-xl bg-[#F4F0EA] hover:bg-rose-50 text-rose-700 border border-[#E5E1DA] text-xs font-semibold transition"
                    >
                      Reset to Default Art
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formData.deityImageUrl?.startsWith('data:') ? '' : (formData.deityImageUrl || '')}
                    onChange={(e) => {
                      const url = e.target.value.trim();
                      setFormData(prev => ({ ...prev, deityImageUrl: url || undefined }));
                      if (url) {
                        saveDeityImage(url);
                      } else {
                        clearDeityImage();
                      }
                    }}
                    placeholder="Or paste direct Image URL (https://...)"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E1DA] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                  />
                </div>

                <p className="text-[11px] text-[#8C7A65]">
                  Select any photo or enter an image URL. All customer screens update instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">Agency / Brand Name</label>
              <input
                type="text"
                value={formData.agencyName}
                onChange={e => setFormData({ ...formData, agencyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">Executive / Broker Name</label>
              <input
                type="text"
                value={formData.brokerName}
                onChange={e => setFormData({ ...formData, brokerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>Calling Mobile Number</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                placeholder="e.g. +91 6383040407"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Business Number</span>
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                placeholder="e.g. +91 6383040407"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>Official Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                placeholder="harshith175h@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8C7A65]" />
                <span>Operating Hours</span>
              </label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                placeholder="Monday - Sunday: 8:00 AM - 9:00 PM IST"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8C7A65]" />
              <span>Full Office Address</span>
            </label>
            <textarea
              value={formData.officeAddress}
              onChange={e => setFormData({ ...formData, officeAddress: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
              placeholder="e.g. No. 42, Sri Varahi Complex, Main Road, City, State - Pin Code"
              required
            />
          </div>

          {/* Primary Locations / Cities Served */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">Primary Locations / Cities Served</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLocation(); }}}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E5E1DA] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A484]"
                placeholder="Add city or district (e.g. Salem, Trichy, Coimbatore)"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.primaryLocations.map(loc => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1DA] text-xs font-medium text-[#1A1A1A]"
                >
                  <MapPin className="w-3 h-3 text-[#8C7A65]" />
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="text-[#8C7A65] hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#E5E1DA] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#736B63] hover:text-[#1A1A1A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-xs"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#C4A484]" />
                  Save Business Details
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
