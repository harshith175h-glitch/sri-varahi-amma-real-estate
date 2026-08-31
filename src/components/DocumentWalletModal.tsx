import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Calendar, 
  MapPin, 
  X, 
  Lock, 
  Eye, 
  Download, 
  UserCheck, 
  FileCheck, 
  HelpCircle,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { VaultDocument, DocumentTypeCategory, UserAccount } from '../types';

interface DocumentWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onOpenDealTracker?: () => void;
}

const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-patta-01',
    userId: 'user-default',
    documentType: 'patta_chitta',
    title: 'Patta / Chitta Certificate (Revenue Dept)',
    documentNumber: 'TN-PATTA-2026-88914',
    propertyTitle: 'Morjim Coconut Grove Beachfront Land Parcel',
    verificationMode: 'offline_in_person',
    status: 'verified',
    fileName: 'Patta_Extract_Survey_142_3A.pdf',
    offlineAppointment: {
      date: '2026-08-20',
      time: '11:00 AM',
      locationType: 'office',
      verifiedBy: 'Sri Varahi Amma Broker Desk (Revenue Verification)',
      verificationReference: 'REV-VERIFY-994102',
    },
    tamperProofSealId: 'SEAL-TN-REV-994102',
    legalRemarks: '100% Original Patta verified with Revenue Tehsildar records. Zero encumbrance or dispute found.',
    uploadedAt: '2026-08-20',
  },
  {
    id: 'doc-ec-02',
    userId: 'user-default',
    documentType: 'encumbrance_certificate',
    title: '30-Year Encumbrance Certificate (EC Form 15)',
    documentNumber: 'EC-REG-2026-049182',
    propertyTitle: 'Morjim Coconut Grove Beachfront Land Parcel',
    verificationMode: 'online_upload',
    status: 'verified',
    fileName: 'EC_30Year_Search_Certificate.pdf',
    tamperProofSealId: 'SEAL-SUBREG-881920',
    legalRemarks: 'Nil Encumbrance for past 30 continuous financial years.',
    uploadedAt: '2026-08-21',
  },
  {
    id: 'doc-deed-03',
    userId: 'user-default',
    documentType: 'sale_title_deed',
    title: 'Registered Mother Sale Deed (Conveyance)',
    documentNumber: 'DEED-BK-I-VOL-4192',
    propertyTitle: 'Devanahalli Aerotropolis Gated Villa Plot',
    verificationMode: 'offline_in_person',
    status: 'scheduled_offline_visit',
    offlineAppointment: {
      date: '2026-08-28',
      time: '02:30 PM',
      locationType: 'office',
      verifiedBy: 'Sri Varahi Amma Broker Desk (Office Consultation)',
      verificationReference: 'REG-OFFICE-8192',
    },
    tamperProofSealId: 'PENDING-PHYSICAL-VISIT',
    legalRemarks: 'Scheduled for original physical document inspection at broker office.',
    uploadedAt: '2026-08-24',
  },
  {
    id: 'doc-kyc-04',
    userId: 'user-default',
    documentType: 'pan_aadhaar_kyc',
    title: 'Buyer / Seller Government KYC & PAN Verification',
    documentNumber: 'AADHAAR-KYC-XXXX-4891',
    verificationMode: 'online_upload',
    status: 'verified',
    fileName: 'Aadhaar_PAN_Masked_Verified.pdf',
    tamperProofSealId: 'KYC-AML-PASSED-2026',
    legalRemarks: 'Identity authentication & verification completed.',
    uploadedAt: '2026-08-22',
  },
];

export const DocumentWalletModal: React.FC<DocumentWalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenDealTracker,
}) => {
  const [documents, setDocuments] = useState<VaultDocument[]>(INITIAL_DOCUMENTS);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'offline_scheduled' | 'add_new'>('all');
  
  // New Document Upload / Offline Request Form State
  const [docType, setDocType] = useState<DocumentTypeCategory>('patta_chitta');
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('Morjim Coconut Grove Beachfront Land Parcel');
  const [submissionMode, setSubmissionMode] = useState<'online_upload' | 'offline_in_person'>('offline_in_person');
  const [offlineLocation, setOfflineLocation] = useState<'office' | 'doorstep' | 'sub_registrar_office'>('office');
  const [preferredDate, setPreferredDate] = useState('2026-08-29');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [clientTrustNotes, setClientTrustNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  if (!isOpen) return null;

  const handleAddNewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newDoc: VaultDocument = {
        id: `doc-${Date.now()}`,
        userId: currentUser.id,
        documentType: docType,
        title: docTitle || (
          docType === 'patta_chitta' ? 'Patta / Chitta Revenue Record' :
          docType === 'extract_7_12' ? '7/12 & 8A Land Extract' :
          docType === 'khata_certificate' ? 'A-Khata / RTC Certificate' :
          docType === 'sale_title_deed' ? 'Original Sale Deed' :
          docType === 'encumbrance_certificate' ? '30-Year Encumbrance Certificate (EC)' :
          'Legal Title Document'
        ),
        documentNumber: docNumber || `DOC-REC-${Math.floor(10000 + Math.random() * 90000)}`,
        propertyTitle,
        verificationMode: submissionMode,
        status: submissionMode === 'online_upload' ? 'in_review' : 'scheduled_offline_visit',
        fileName: submissionMode === 'online_upload' ? `${docType}_verified_scan.pdf` : undefined,
        offlineAppointment: submissionMode === 'offline_in_person' ? {
          date: preferredDate,
          time: preferredTime,
          locationType: offlineLocation,
          verifiedBy: 'Sri Varahi Amma Broker Desk (Direct Verification)',
          verificationReference: 'REV-VERIFY-9921',
        } : undefined,
        tamperProofSealId: submissionMode === 'online_upload' ? 'DIGITAL-HASH-VERIFYING' : 'APPOINTMENT-CONFIRMED',
        legalRemarks: submissionMode === 'offline_in_person'
          ? `In-person appointment scheduled for physical inspection at ${offlineLocation === 'office' ? "Sri Varahi Amma Real Estate Office" : offlineLocation === 'doorstep' ? 'Client Doorstep' : 'Sub-Registrar Office'}. Original Patta is safe and never requires online scanning.`
          : 'Uploaded document is under 24-hour verification against government registry database.',
        uploadedAt: new Date().toISOString().split('T')[0],
      };

      setDocuments([newDoc, ...documents]);
      setSuccessBanner(
        submissionMode === 'offline_in_person'
          ? 'Offline Verification Scheduled! Our team will inspect your physical documents in person at our office.'
          : 'Document securely uploaded to encrypted vault for registry verification.'
      );
      setActiveTab('all');

      setTimeout(() => setSuccessBanner(''), 4000);
    }, 700);
  };

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'verified') return doc.status === 'verified';
    if (activeTab === 'offline_scheduled') return doc.status === 'scheduled_offline_visit';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] flex flex-col font-sans">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#FCFAF7]/95 backdrop-blur-md px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white shadow-xs">
              <FileText className="w-5 h-5 text-[#C4A484]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Buyer & Vendor Document Wallet
              </h2>
              <p className="text-xs text-[#8C7A65]">
                Online Encrypted Vault & Offline In-Person Patta / Deed Verification
              </p>
            </div>
          </div>

          <button
            id="btn-close-doc-wallet"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
            aria-label="Close document wallet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 space-y-6">

          {/* Success Banner */}
          {successBanner && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Customer Trust & Offline Verification Advisory Box */}
          <div className="bg-white border border-[#E5E1DA] rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-[#E5E1DA] pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
                  Online vs. Offline Trust Guarantee: How We Protect You
                </h3>
              </div>
              <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                100% Client Discretion
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#736B63] leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-1.5">
                <div className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Offline Physical Document Scrutiny (At Our Broker Office)</span>
                </div>
                <p>
                  If you are hesitant or uncomfortable sharing your original <strong>Patta / Chitta Certificate</strong>, <strong>7/12 Extract</strong>, or <strong>Mother Deed</strong> online, you never have to. You can bring them directly to the Sri Varahi Amma Real Estate office or request an in-person meeting during a land site visit.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-1.5">
                <div className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8C7A65]" />
                  <span>Encrypted Online Vault (For Instant Verification)</span>
                </div>
                <p>
                  For digital users and NRI buyers, documents uploaded here are encrypted end-to-end with zero third-party access, watermarked with your buyer/seller ID, and cross-referenced with official government registries.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1DA] pb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === 'all'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                }`}
              >
                All Documents ({documents.length})
              </button>

              <button
                onClick={() => setActiveTab('verified')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === 'verified'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                }`}
              >
                Verified & Sealed ({documents.filter(d => d.status === 'verified').length})
              </button>

              <button
                onClick={() => setActiveTab('offline_scheduled')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeTab === 'offline_scheduled'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-[#736B63] hover:text-[#1A1A1A] border border-[#E5E1DA]'
                }`}
              >
                Offline In-Person Visits ({documents.filter(d => d.status === 'scheduled_offline_visit').length})
              </button>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'add_new' ? 'all' : 'add_new')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#C4A484]" />
              <span>{activeTab === 'add_new' ? 'View Document List' : 'Add Document / Book In-Person Visit'}</span>
            </button>
          </div>

          {/* Form: Add New Document or Schedule Offline In-Person Verification */}
          {activeTab === 'add_new' ? (
            <form onSubmit={handleAddNewDocument} className="bg-white border border-[#E5E1DA] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
              <div className="border-b border-[#E5E1DA] pb-3">
                <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
                  Add Document or Schedule In-Person Verification
                </h3>
                <p className="text-xs text-[#736B63]">
                  Choose whether you want to upload a digital copy or schedule an in-person physical review with our broker office team.
                </p>
              </div>

              {/* Mode Switcher: Online Upload vs Offline Physical Scrutiny */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block">
                  Step 1: Choose Verification Method (Online or Offline) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmissionMode('offline_in_person')}
                    className={`p-4 rounded-xl border text-left transition ${
                      submissionMode === 'offline_in_person'
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#FCFAF7] hover:bg-[#F4F0EA] border-[#E5E1DA] text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#C4A484]" />
                        <span>🤝 In-Person Office Review (High Trust)</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${submissionMode === 'offline_in_person' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                        Recommended for Patta
                      </span>
                    </div>
                    <p className={`text-[11px] ${submissionMode === 'offline_in_person' ? 'text-white/80' : 'text-[#736B63]'}`}>
                      No online document upload needed. Bring original physical Patta/Sale Deed to our office or during a land site inspection.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmissionMode('online_upload')}
                    className={`p-4 rounded-xl border text-left transition ${
                      submissionMode === 'online_upload'
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#FCFAF7] hover:bg-[#F4F0EA] border-[#E5E1DA] text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#C4A484]" />
                        <span>⚡ Encrypted Online Vault</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${submissionMode === 'online_upload' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        Fast KYC / EC
                      </span>
                    </div>
                    <p className={`text-[11px] ${submissionMode === 'online_upload' ? 'text-white/80' : 'text-[#736B63]'}`}>
                      Upload encrypted PDF/Image scan directly for automated government registry authentication.
                    </p>
                  </button>
                </div>
              </div>

              {/* Document Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">
                    Document Category *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-medium"
                  >
                    <option value="patta_chitta">📜 Patta / Chitta Certificate (Revenue Dept)</option>
                    <option value="extract_7_12">🚜 7/12 Extract & 8A (Maharashtra / Gujarat)</option>
                    <option value="khata_certificate">🏛️ A-Khata / RTC / Mutation Register</option>
                    <option value="sale_title_deed">📑 Registered Mother Sale Deed</option>
                    <option value="encumbrance_certificate">🛡️ 30-Year Encumbrance Certificate (EC)</option>
                    <option value="rera_layout_sanction">🏗️ RERA / DTCP / HMDA Sanction Layout</option>
                    <option value="pan_aadhaar_kyc">🪪 Aadhaar / PAN / Passport Identity</option>
                    <option value="bank_noc">🏦 Bank NOC / Loan Clearance</option>
                    <option value="other">📋 Other Legal Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-sans font-bold text-[#1A1A1A] block mb-1">
                    Document / Survey / Registration No.
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. TN-PATTA-88412 or Survey 142/3A"
                    className="w-full bg-[#FCFAF7] border border-[#E5E1DA] rounded-xl p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Conditional: Offline In-Person Scheduling Details */}
              {submissionMode === 'offline_in_person' ? (
                <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E5E1DA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                    <Calendar className="w-4 h-4 text-[#8C7A65]" />
                    <span>Schedule In-Person Meeting at Sri Varahi Amma Office or Site</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">
                        Meeting Location
                      </label>
                      <select
                        value={offlineLocation}
                        onChange={(e) => setOfflineLocation(e.target.value as any)}
                        className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2 text-xs text-[#1A1A1A] focus:outline-none"
                      >
                        <option value="office">Sri Varahi Amma Broker Office</option>
                        <option value="doorstep">Your Home / Office Doorstep</option>
                        <option value="sub_registrar_office">Sub-Registrar Office</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2 text-xs text-[#1A1A1A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-sans font-bold text-[#8C7A65] block mb-1">
                        Time Slot
                      </label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full bg-white border border-[#E5E1DA] rounded-xl p-2 text-xs text-[#1A1A1A] focus:outline-none"
                      >
                        <option value="10:30 AM">10:30 AM (Morning)</option>
                        <option value="02:30 PM">02:30 PM (Afternoon)</option>
                        <option value="05:00 PM">05:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#736B63] italic">
                    * Our broker team verifies physical revenue stamps, survey pegs, and registered sale deeds offline.
                  </p>
                </div>
              ) : (
                /* Online Upload Input */
                <div className="p-6 rounded-2xl bg-[#FCFAF7] border-2 border-dashed border-[#E5E1DA] text-center space-y-2">
                  <Upload className="w-8 h-8 text-[#8C7A65] mx-auto" />
                  <div className="text-xs font-bold text-[#1A1A1A]">Click to select PDF or image file</div>
                  <p className="text-[11px] text-[#736B63]">Supports PDF, JPG, PNG up to 25MB (Encrypted automatically)</p>
                  <input type="file" className="text-xs text-[#736B63] mx-auto block pt-1" />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-full bg-[#FCFAF7] border border-[#E5E1DA] text-xs text-[#736B63] hover:text-[#1A1A1A]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C4A484]" />
                  <span>
                    {isSubmitting ? 'Processing...' : submissionMode === 'offline_in_person' ? 'Confirm In-Person Appointment' : 'Securely Upload to Vault'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* Document List Cards */
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-[#E5E1DA] rounded-2xl p-4 sm:p-5 hover:border-[#8C7A65] transition shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        doc.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#FCFAF7] text-[#8C7A65] border border-[#E5E1DA]'
                      }`}>
                        {doc.status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif font-bold text-sm sm:text-base text-[#1A1A1A]">
                            {doc.title}
                          </h4>
                          <span className={`text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full border ${
                            doc.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {doc.status === 'verified' ? 'Verified & Title Clear' : 'In-Person Review Scheduled'}
                          </span>
                        </div>

                        <p className="text-xs text-[#736B63]">
                          <strong>Doc / Survey Ref:</strong> <span className="font-mono">{doc.documentNumber || 'N/A'}</span> • <strong>Property:</strong> {doc.propertyTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A65] block">
                        Verification Mode
                      </span>
                      <span className="text-xs font-semibold text-[#1A1A1A]">
                        {doc.verificationMode === 'offline_in_person' ? '🤝 In-Person Office Check' : '⚡ Encrypted Online Vault'}
                      </span>
                    </div>
                  </div>

                  {/* Offline Appointment or Legal Remarks Banner */}
                  <div className="p-3 rounded-xl bg-[#FCFAF7] border border-[#E5E1DA] text-xs space-y-1.5">
                    {doc.offlineAppointment && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E1DA] pb-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-[#1A1A1A] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#8C7A65]" />
                          <span>Appointment: {doc.offlineAppointment.date} at {doc.offlineAppointment.time}</span>
                        </div>
                        <div className="text-[#8C7A65]">
                          Handler: <strong>{doc.offlineAppointment.verifiedBy}</strong> ({doc.offlineAppointment.verificationReference})
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3 text-[11px] text-[#736B63]">
                      <div>
                        <strong className="text-[#1A1A1A]">Verification Status:</strong> {doc.legalRemarks}
                      </div>
                      {doc.tamperProofSealId && (
                        <div className="shrink-0 font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Ref: {doc.tamperProofSealId}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FCFAF7] border-t border-[#E5E1DA] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#736B63]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Sri Varahi Amma Real Estate • Registered Sale Deed & Patta Revenue Verification</span>
          </div>

          {onOpenDealTracker && (
            <button
              onClick={() => {
                onClose();
                onOpenDealTracker();
              }}
              className="px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Open Deal & Escrow Tracker →
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
