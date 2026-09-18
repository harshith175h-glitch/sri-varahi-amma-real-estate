import React, { useCallback, useEffect, useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  RefreshCw,
  Inbox,
  Trash2,
  Plus,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  IndianRupee,
} from 'lucide-react';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { formatPrice } from '../utils/currency';
import {
  fetchInquiries,
  updateInquiryStatus,
  fetchProperties,
  deleteProperty,
  updateProperty,
  StoredInquiryRecord,
  StoredPropertyRecord,
} from '../utils/api';

interface OwnerDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: () => void;
  onSelectPropertyId?: (propertyId: string) => void;
}

type Tab = 'leads' | 'listings';
type LeadFilter = 'all' | 'new' | 'contacted' | 'closed';

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-[#FDF3D7] text-[#8A6A12] border-[#E9D79B]',
  contacted: 'bg-[#E8F1FB] text-[#1F5C9E] border-[#BBD6F0]',
  closed: 'bg-[#EBF7EE] text-[#1E7E34] border-[#C3E6CB]',
};

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMinutes = Math.round((Date.now() - then) / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/**
 * Owner Desk — the two screens a broker actually needs on a phone:
 *   1. Leads: every enquiry captured by the site, with one-tap call / WhatsApp.
 *   2. Listings: the plots published to the server, with price edit and delete.
 *
 * Everything here talks to the API as "staff": a signed session from the owner
 * PIN login, or the admin token pasted in Broker Settings.
 */
export const OwnerDeskModal: React.FC<OwnerDeskModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  onSelectPropertyId,
}) => {
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });

  const [tab, setTab] = useState<Tab>('leads');
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<StoredInquiryRecord[]>([]);
  const [listings, setListings] = useState<StoredPropertyRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [leadRes, propRes] = await Promise.all([fetchInquiries(), fetchProperties()]);

    if (leadRes.ok && leadRes.data) {
      setLeads(leadRes.data.inquiries || []);
    } else if (leadRes.status === 401) {
      setError(
        'The owner desk is not authorised on this device. Sign in with your owner PIN, or paste the admin token in “Edit Contact Info”.'
      );
    } else if (leadRes.offline) {
      setError('The server could not be reached, so leads cannot be loaded right now.');
    } else {
      setError(leadRes.data?.error || 'Could not load leads.');
    }

    if (propRes.ok && propRes.data) {
      setListings(propRes.data.properties || []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPriceEdits({});
      void load();
    }
  }, [isOpen, load]);

  const handleStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
    setBusyId(id);
    const res = await updateInquiryStatus(id, status);
    if (res.ok) {
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    } else {
      setError(res.data?.error || 'Could not update that lead.');
    }
    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const res = await deleteProperty(id);
    if (res.ok) {
      setListings((prev) => prev.filter((p) => p.id !== id));
    } else {
      setError(res.data?.error || 'Could not delete that listing.');
    }
    setBusyId(null);
  };

  const handlePriceSave = async (property: StoredPropertyRecord) => {
    const raw = (priceEdits[property.id] || '').replace(/[^0-9.]/g, '');
    const priceINR = parseFloat(raw);
    if (!priceINR || priceINR <= 0) {
      setError('Enter a valid price before saving.');
      return;
    }
    setBusyId(property.id);
    const res = await updateProperty(property.id, { priceINR });
    if (res.ok && res.data?.property) {
      setListings((prev) => prev.map((p) => (p.id === property.id ? res.data!.property! : p)));
      setPriceEdits((prev) => ({ ...prev, [property.id]: '' }));
    } else {
      setError(res.data?.error || 'Could not update the price.');
    }
    setBusyId(null);
  };

  const filteredLeads = leads.filter((lead) => leadFilter === 'all' || (lead.status || 'new') === leadFilter);
  const newCount = leads.filter((lead) => (lead.status || 'new') === 'new').length;

  const whatsappReply = (lead: StoredInquiryRecord) => {
    const digits = String(lead.userPhone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Namaste ${lead.userName || ''}, this is Sri Varahi Amma Real Estate. Thank you for your enquiry about ${
        lead.propertyTitle || 'our property'
      }${lead.propertyCity ? ` in ${lead.propertyCity}` : ''}${
        lead.preferredDate ? ` for ${lead.preferredDate}` : ''
      }. When would you like to visit the site? We can arrange a land inspection with the Patta and survey documents ready.`
    );
    return `https://wa.me/${digits}?text=${text}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto font-sans"
    >
      <div className="bg-[#FCFAF7] rounded-3xl w-full max-w-3xl my-auto shadow-2xl border border-[#E6E0D5] overflow-hidden">
        {/* Header */}
        <div className="bg-[#171513] text-[#F5F2EB] p-5 flex items-center justify-between border-b border-[#2A2622]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2A2520] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Inbox className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">Owner Desk</h2>
              <p className="text-[11px] text-[#A89E92]">
                {newCount > 0 ? `${newCount} new enquir${newCount === 1 ? 'y' : 'ies'} waiting` : 'Leads & published listings'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void load()}
              title="Refresh"
              aria-label="Refresh owner desk data"
              className="p-2 rounded-full text-[#A89E92] hover:text-white hover:bg-[#2A2520] transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close owner desk"
              className="p-2 rounded-full text-[#A89E92] hover:text-white hover:bg-[#2A2520] transition"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-[#FAF7F2] border-b border-[#E6E0D5] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('leads')}
            className={`py-3 flex items-center justify-center gap-2 transition ${
              tab === 'leads' ? 'bg-white text-[#171513] border-b-2 border-[#171513] font-bold' : 'text-[#786F64]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Enquiries ({leads.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('listings')}
            className={`py-3 flex items-center justify-center gap-2 transition ${
              tab === 'listings' ? 'bg-white text-[#171513] border-b-2 border-[#171513] font-bold' : 'text-[#786F64]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Published listings ({listings.length})</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#736B63]">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Loading…</span>
            </div>
          )}

          {/* ---------------- LEADS ---------------- */}
          {!isLoading && tab === 'leads' && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'new', 'contacted', 'closed'] as LeadFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setLeadFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                      leadFilter === filter
                        ? 'bg-[#171513] text-white border-[#171513]'
                        : 'bg-white text-[#736B63] border-[#E5E1DA] hover:bg-[#F4F0EA]'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {filteredLeads.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Inbox className="w-8 h-8 text-[#C4BCB0] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-serif font-bold text-[#1A1A1A]">No enquiries here yet</p>
                  <p className="text-xs text-[#736B63] max-w-sm mx-auto">
                    Every “Site Visit” request submitted on the website lands in this list with the buyer's
                    name, phone number and preferred date.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredLeads.map((lead) => {
                    const status = lead.status || 'new';
                    const digits = String(lead.userPhone || '').replace(/[^0-9+]/g, '');
                    return (
                      <li key={lead.id} className="bg-white border border-[#E5E1DA] rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                                {lead.userName || 'Unnamed buyer'}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.new}`}>
                                {status}
                              </span>
                              {lead.tourType && (
                                <span className="text-[10px] text-[#736B63] bg-[#F4F0EA] px-2 py-0.5 rounded-full">
                                  {lead.tourType}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#736B63] mt-1 flex items-center gap-1 flex-wrap">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              <span>{relativeTime(lead.createdAt)}</span>
                              {lead.preferredDate && <span>• Visit: {lead.preferredDate} {lead.preferredTime}</span>}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-[#1A1A1A] whitespace-nowrap">
                            {lead.userPhone}
                          </span>
                        </div>

                        <div className="text-xs text-[#1A1A1A] bg-[#FAF8F5] border border-[#EDE8DF] rounded-xl p-3 space-y-1">
                          <p className="font-semibold">
                            {lead.propertyTitle || 'General enquiry'}
                            {lead.propertyCity ? ` — ${lead.propertyCity}` : ''}
                          </p>
                          {lead.propertyPrice && <p className="text-[11px] text-[#736B63]">Listed at {lead.propertyPrice}</p>}
                          {lead.message && <p className="text-[11px] text-[#736B63] leading-relaxed">“{lead.message}”</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`tel:${digits}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#171513] text-white text-[11px] font-bold hover:bg-black transition"
                          >
                            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                            Call
                          </a>
                          <a
                            href={whatsappReply(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366]/15 text-[#128C7E] border border-[#25D366]/40 text-[11px] font-bold hover:bg-[#25D366]/25 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            WhatsApp reply
                          </a>
                          {lead.userEmail && (
                            <a
                              href={`mailto:${lead.userEmail}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E5E1DA] text-[11px] font-semibold text-[#1A1A1A] hover:bg-[#F4F0EA] transition"
                            >
                              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                              Email
                            </a>
                          )}
                          {status !== 'contacted' && (
                            <button
                              type="button"
                              disabled={busyId === lead.id}
                              onClick={() => void handleStatus(lead.id, 'contacted')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E5E1DA] text-[11px] font-semibold text-[#1A1A1A] hover:bg-[#F4F0EA] disabled:opacity-50 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Mark contacted
                            </button>
                          )}
                          {status !== 'closed' && (
                            <button
                              type="button"
                              disabled={busyId === lead.id}
                              onClick={() => void handleStatus(lead.id, 'closed')}
                              className="px-3 py-2 rounded-full text-[11px] font-semibold text-[#736B63] hover:text-[#1A1A1A] disabled:opacity-50 transition"
                            >
                              Close lead
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {/* ---------------- LISTINGS ---------------- */}
          {!isLoading && tab === 'listings' && (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddProperty();
                }}
                className="w-full py-3 rounded-2xl bg-[#171513] hover:bg-black text-[#D4AF37] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Publish a new plot / property</span>
              </button>

              {listings.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <MapPin className="w-8 h-8 text-[#C4BCB0] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-serif font-bold text-[#1A1A1A]">No server listings yet</p>
                  <p className="text-xs text-[#736B63] max-w-sm mx-auto">
                    Listings you publish here are stored on the server and shown to every visitor — unlike
                    the earlier build, where a “published” plot was visible only in your own browser.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {listings.map((property) => {
                    const priceINR = Number(property.priceINR || 0);
                    const images = Array.isArray(property.images) ? (property.images as string[]) : [];
                    return (
                      <li key={property.id} className="bg-white border border-[#E5E1DA] rounded-2xl p-3 flex gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F4F0EA] shrink-0">
                          {images[0] && (
                            <img
                              src={images[0]}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div>
                            <p className="font-serif font-bold text-sm text-[#1A1A1A] line-clamp-1">
                              {String(property.title || 'Untitled')}
                            </p>
                            <p className="text-[11px] text-[#736B63]">
                              {String(property.locality || '')}
                              {property.locality ? ', ' : ''}
                              {String(property.city || '')} • {String(property.propertyType || '')}
                            </p>
                            <p className="text-xs font-bold text-[#1A1816] flex items-center gap-1 mt-0.5">
                              <IndianRupee className="w-3 h-3" aria-hidden="true" />
                              {formatPrice(priceINR, 'INR', property.listingType === 'rent' ? 'rent' : 'sale')}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={priceEdits[property.id] ?? ''}
                              onChange={(e) => setPriceEdits((prev) => ({ ...prev, [property.id]: e.target.value }))}
                              placeholder="New price in ₹"
                              aria-label={`New price for ${String(property.title || 'listing')}`}
                              className="w-32 px-2.5 py-1.5 rounded-lg border border-[#E5E1DA] bg-[#FAF8F5] text-[11px] focus:outline-none focus:ring-1 focus:ring-[#171513]"
                            />
                            <button
                              type="button"
                              disabled={busyId === property.id || !priceEdits[property.id]}
                              onClick={() => void handlePriceSave(property)}
                              className="px-3 py-1.5 rounded-lg bg-[#171513] text-white text-[11px] font-bold disabled:opacity-40 transition"
                            >
                              Save price
                            </button>
                            {onSelectPropertyId && (
                              <button
                                type="button"
                                onClick={() => onSelectPropertyId(property.id)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E1DA] text-[11px] font-semibold hover:bg-[#F4F0EA] transition"
                              >
                                View
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busyId === property.id}
                              onClick={() => void handleDelete(property.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold hover:bg-rose-100 disabled:opacity-40 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="bg-[#FAF7F2] border-t border-[#E6E0D5] p-3 text-center text-[10px] text-[#786F64]">
          Owner-only screen • enquiries and listings are stored on the server, not in a visitor's browser
        </div>
      </div>
    </div>
  );
};
