import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  MessageCircle, 
  Phone, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Languages,
  Sparkles,
  Check
} from 'lucide-react';
import { Agent, CommunicationProfile } from '../types';
import { MOCK_AGENTS } from '../data/mockProperties';

interface AgentDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgentProperties?: (agentName: string) => void;
  communicationProfile: CommunicationProfile;
}

const COMMON_LANG_FILTERS = [
  'All',
  'My Languages',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Hindi',
  'Arabic',
  'French',
  'Spanish',
];

export const AgentDirectoryModal: React.FC<AgentDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectAgentProperties,
  communicationProfile,
}) => {
  if (!isOpen) return null;

  const [regionFilter, setRegionFilter] = useState<'all' | 'india' | 'international'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = MOCK_AGENTS.filter((agent) => {
    // Region filter
    if (regionFilter !== 'all' && agent.region !== regionFilter && agent.region !== 'both') {
      return false;
    }

    // Language filter
    if (languageFilter === 'My Languages') {
      const hasMatch = agent.languages.some((l) =>
        communicationProfile.spokenLanguages.includes(l)
      );
      if (!hasMatch) return false;
    } else if (languageFilter !== 'All') {
      if (!agent.languages.includes(languageFilter)) return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.city.toLowerCase().includes(q) ||
        agent.agency.toLowerCase().includes(q) ||
        agent.languages.some((l) => l.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleWhatsApp = (agent: Agent) => {
    const cleanNumber = agent.whatsapp.replace(/[^0-9]/g, '');
    const userLangs = communicationProfile.spokenLanguages.join(', ');
    const message = encodeURIComponent(
      `Hello ${agent.name},\n\nI found your profile on TerraGlobal Realty.\n👤 Client: ${communicationProfile.name || 'Interested Investor'}\n🗣️ Languages: ${userLangs}\n\nI would like to consult regarding prime property opportunities in ${agent.city}.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">Concierge Network</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">Verified Real Estate Advisors</h3>
              <p className="text-xs font-sans text-[#736B63]">
                Licensed luxury realtors across India and prime foreign global capitals with multilingual capabilities
              </p>
            </div>
          </div>

          <button
            id="btn-close-agents-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Language Match Tip Banner */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E1DA] flex items-center justify-between gap-3 text-xs font-sans shadow-2xs">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#8C7A65]" />
            <span className="text-[#736B63]">Your Spoken Languages:</span>
            <strong className="text-[#1A1A1A]">{communicationProfile.spokenLanguages.join(', ')}</strong>
          </div>

          <button
            onClick={() => setLanguageFilter('My Languages')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
              languageFilter === 'My Languages'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-[#FCFAF7] border border-[#E5E1DA] text-[#8C7A65] hover:text-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#C4A484]" />
            <span>Show Matching Advisors</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3 font-sans">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Region Tabs */}
            <div className="flex items-center bg-white p-1 rounded-full border border-[#E5E1DA] text-xs">
              <button
                onClick={() => setRegionFilter('all')}
                className={`px-4 py-1.5 rounded-full font-bold transition ${
                  regionFilter === 'all' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#736B63] hover:text-[#1A1A1A]'
                }`}
              >
                All Regions ({MOCK_AGENTS.length})
              </button>
              <button
                onClick={() => setRegionFilter('india')}
                className={`px-4 py-1.5 rounded-full font-bold transition ${
                  regionFilter === 'india' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#736B63] hover:text-[#1A1A1A]'
                }`}
              >
                🇮🇳 India
              </button>
              <button
                onClick={() => setRegionFilter('international')}
                className={`px-4 py-1.5 rounded-full font-bold transition ${
                  regionFilter === 'international' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#736B63] hover:text-[#1A1A1A]'
                }`}
              >
                🌍 Foreign / Global
              </button>
            </div>

            {/* Search Bar */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search advisor name, city, language..."
              className="bg-white border border-[#E5E1DA] rounded-full px-4 py-1.5 text-xs text-[#1A1A1A] placeholder-[#736B63] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] shadow-2xs"
            />
          </div>

          {/* Spoken Language Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] uppercase font-bold text-[#8C7A65] tracking-wider mr-1">
              Language:
            </span>
            {COMMON_LANG_FILTERS.map((lang) => {
              const isSelected = languageFilter === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white font-bold shadow-xs'
                      : 'bg-white border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A]'
                  }`}
                >
                  {lang === 'My Languages' ? '✨ My Spoken Languages' : lang}
                </button>
              );
            })}
          </div>

        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map((agent) => {
            const matchedLangs = agent.languages.filter((l) =>
              communicationProfile.spokenLanguages.includes(l)
            );
            const isMatch = matchedLangs.length > 0;

            return (
              <div
                key={agent.id}
                className="bg-white border border-[#E5E1DA] rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#8C7A65] transition"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border border-[#E5E1DA] shadow-xs shrink-0"
                  />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif font-bold text-base text-[#1A1A1A] truncate">{agent.name}</h4>
                      <ShieldCheck className="w-4 h-4 text-[#8C7A65] shrink-0" />
                    </div>
                    
                    <p className="text-xs font-sans text-[#736B63] font-medium truncate">{agent.agency}</p>
                    
                    <p className="text-xs font-sans text-[#736B63] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C7A65]" />
                      <span>{agent.city} • {agent.region === 'india' ? 'India' : 'International'}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs font-sans">
                      <div className="flex items-center gap-1 text-[#8C7A65] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#8C7A65] text-[#8C7A65]" />
                        <span>{agent.rating}</span>
                      </div>
                      <span className="text-[#736B63]">({agent.reviewsCount} reviews)</span>
                      <span className="text-[#736B63]">• {agent.experienceYears} yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* Spoken Languages & Match Indicator */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-[#736B63] mr-0.5 self-center">Languages:</span>
                    {agent.languages.map((lang) => {
                      const userSpeaks = communicationProfile.spokenLanguages.includes(lang);
                      return (
                        <span
                          key={lang}
                          className={`px-2.5 py-0.5 rounded-full border font-medium ${
                            userSpeaks
                              ? 'bg-[#F4F0EA] text-[#1A1A1A] border-[#8C7A65] font-bold'
                              : 'bg-[#FCFAF7] text-[#736B63] border-[#E5E1DA]'
                          }`}
                        >
                          {lang}
                        </span>
                      );
                    })}
                  </div>

                  {isMatch && (
                    <div className="text-[10px] text-[#8C7A65] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#8C7A65]" />
                      <span>Matches your languages: {matchedLangs.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E1DA]">
                  <button
                    type="button"
                    onClick={() => handleWhatsApp(agent)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-sans font-bold text-xs shadow-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={`tel:${agent.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white hover:bg-[#F4F0EA] text-[#1A1A1A] font-sans font-semibold text-xs border border-[#E5E1DA] transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#8C7A65]" />
                    <span>Call Advisor</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
