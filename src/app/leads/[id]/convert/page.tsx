'use client';

import React, { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CornerUpRight,
  X,
  FileText,
  Calendar,
  Check,
  HelpCircle,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Building,
  DollarSign,
  Percent,
  Upload,
  User,
  CheckSquare,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConvertLeadPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    leads,
    updateLead,
    addCustomer,
    addOpportunity,
  } = useEnterpriseCrm();

  // Find lead by ID or fallback
  const lead = useMemo(() => {
    const rawId = decodeURIComponent(resolvedParams.id);
    const found = leads.find(
      (l) =>
        l.id.toLowerCase() === rawId.toLowerCase() ||
        l.slNo.toString() === rawId ||
        l.id.replace('lead-', '').toLowerCase() === rawId.toLowerCase()
    );

    if (found) return found;

    return (
      leads[0] || {
        id: 'lead-1',
        slNo: 1,
        leadDate: '21-09-2026',
        contactDetails: {
          salutation: 'Mr.',
          name: 'WAQUAR',
          phone: '971581941460',
          personalMobile: '',
          company: 'URUGUAY GENERAL TRADING',
          email: '',
          nationality: 'United Arab Emirates',
        },
        leadSpecification: 'Supply of portable air conditioners',
        owner: 'JISMON JOSE',
        rating: 'Cold' as LeadRating,
        status: 'Contacted' as LeadStatus,
        comments: 'PROVIDED PRICE FOR SUPER GENERAL PORTABLE AC - SGP204T3',
        value: 85000,
        source: '',
      }
    );
  }, [leads, resolvedParams.id]);

  // Top Owner
  const [owner, setOwner] = useState(lead.owner || 'JISMON JOSE');

  // ── Section 1: Contact Details ──
  const [salutation, setSalutation] = useState(lead.contactDetails.salutation || 'Mr.');
  const [contactName, setContactName] = useState(
    lead.contactDetails.name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Eng\.)\s*/i, '') || 'WAQUAR'
  );
  const [contactSource, setContactSource] = useState(lead.source || '');
  const [businessCountryCode, setBusinessCountryCode] = useState('+971');
  const [businessMobile, setBusinessMobile] = useState(
    lead.contactDetails.phone.replace(/^\+971|\+968|\+966|\+91|\+1/g, '').replace(/[^0-9]/g, '') || '971581941460'
  );
  const [contactEmail, setContactEmail] = useState(lead.contactDetails.email || '');
  const [contactNationality, setContactNationality] = useState(
    lead.contactDetails.nationality || 'United Arab Emirates'
  );
  const [spokenLanguage, setSpokenLanguage] = useState('');
  const [designation, setDesignation] = useState(lead.contactDetails.designation || '');
  const [contactSourceName, setContactSourceName] = useState(lead.sourceName || '');
  const [personalCountryCode, setPersonalCountryCode] = useState('+971');
  const [personalMobile, setPersonalMobile] = useState(lead.contactDetails.personalMobile || '');
  const [contactAddress, setContactAddress] = useState('');
  const [contactState, setContactState] = useState('');
  const [contactComments, setContactComments] = useState(
    lead.comments || 'PROVIDED PRICE FOR SUPER GENERAL PORTABLE AC - SGP204T3'
  );

  // ── Section 2: Customer Details ──
  const [customerName, setCustomerName] = useState(lead.contactDetails.company || 'URUGUAY GENERAL TRADING');
  const [parentCustomer, setParentCustomer] = useState('');
  const [custSource, setCustSource] = useState(lead.source || '');
  const [isKeyCustomer, setIsKeyCustomer] = useState(false);
  const [numEmployees, setNumEmployees] = useState('');
  const [custEmail, setCustEmail] = useState(lead.contactDetails.email || '');
  const [custAddress, setCustAddress] = useState('');
  const [custState, setCustState] = useState('');
  const [custComments, setCustComments] = useState('');
  const [trn, setTrn] = useState('');
  const [industryType, setIndustryType] = useState('');
  const [customerTags, setCustomerTags] = useState(lead.tags?.join(', ') || '');
  const [custSourceName, setCustSourceName] = useState('');
  const [custCampaign, setCustCampaign] = useState(lead.campaign || '');
  const [telCountryCode, setTelCountryCode] = useState('+971');
  const [custTel, setCustTel] = useState(lead.contactDetails.telephone || '');
  const [custWebsite, setCustWebsite] = useState(lead.contactDetails.website || '');
  const [custCountry, setCustCountry] = useState('United Arab Emirates');
  const [custLocation, setCustLocation] = useState(lead.location || '');
  const [isSupplier, setIsSupplier] = useState(false);

  // ── Section 3: Opportunity Details ──
  const [includeOpportunity, setIncludeOpportunity] = useState(true);
  const [oppTitle, setOppTitle] = useState(
    lead.leadSpecification || 'Supply & Installation of Super General AC Units'
  );
  const [oppNumber] = useState(`CTEQ#${Math.floor(1000 + Math.random() * 9000)}`);
  const [oppDate, setOppDate] = useState('24-09-2026');
  const [oppSource, setOppSource] = useState(lead.source || 'Website Inbound');
  const [oppSourceName, setOppSourceName] = useState('');
  const [oppTags, setOppTags] = useState(lead.tags?.join(', ') || '');
  const [oppRating, setOppRating] = useState<'Cold' | 'Warm' | 'Hot'>(
    (lead.rating as 'Cold' | 'Warm' | 'Hot') || 'Cold'
  );
  const [oppStage, setOppStage] = useState('Enquiry');
  const [oppCloseDate, setOppCloseDate] = useState('2026-10-24');
  const [oppAmount, setOppAmount] = useState<number | string>(lead.value || 85000);
  const [oppBusinessOpportunity, setOppBusinessOpportunity] = useState(
    lead.businessOpportunity || ''
  );
  const [oppComments, setOppComments] = useState(
    lead.comments || 'PROVIDED PRICE FOR SUPER GENERAL PORTABLE AC - SGP204T3'
  );
  const [lpoNumber, setLpoNumber] = useState('');
  const [lpoDate, setLpoDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [competitorsDetails, setCompetitorsDetails] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [winProbability, setWinProbability] = useState(10);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Form Submission
  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullContactPhone = `${businessCountryCode}${businessMobile}`;
    const fullContactName = `${salutation} ${contactName.trim()}`;

    // 1. Mark Lead as Converted
    updateLead(lead.id, {
      status: 'Converted',
      owner,
      contactDetails: {
        ...lead.contactDetails,
        salutation,
        name: fullContactName,
        phone: fullContactPhone,
        company: customerName,
        email: contactEmail || custEmail,
        designation,
        nationality: contactNationality,
      },
    });

    // 2. Add New Customer
    addCustomer({
      customerName,
      contactPerson: fullContactName,
      phone: fullContactPhone,
      email: custEmail || contactEmail || '',
      owner,
      status: 'Active',
      lastActivity: 'Just converted from Lead',
      companyGroup: industryType || 'Enterprise Key Accounts',
      totalDeals: 1,
      totalSpend: Number(oppAmount) || lead.value || 50000,
    });

    // 3. Add Opportunity if checked
    if (includeOpportunity) {
      addOpportunity({
        opportunityCode: oppNumber,
        title: `${oppNumber} ${oppTitle.toUpperCase()} / ${customerName.toUpperCase()}`,
        customer: customerName,
        contactPerson: fullContactName,
        phone: fullContactPhone,
        amount: Number(oppAmount) || lead.value || 50000,
        stage: oppStage,
        owner,
        probability: winProbability,
        expectedClose: oppCloseDate,
      });
    }

    setTimeout(() => {
      alert(`Lead "${fullContactName}" converted successfully into Customer & Sales Opportunity!`);
      router.push('/leads');
    }, 400);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-full space-y-3 pb-16">
      {/* ── Top Header Strip ────────────────────────────────────────── */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-[3px] shadow-xs px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CornerUpRight className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[2]" />
          <h1 className="text-xs sm:text-sm font-bold text-[#1e293b] tracking-wide truncate">
            Convert Lead
          </h1>
        </div>

        {/* Red Close Button */}
        <button
          type="button"
          onClick={handleBack}
          title="Close and return"
          className="flex-shrink-0 bg-[#e74c3c] hover:bg-[#c0392b] text-white p-1 rounded-[2px] transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* ── Subnav Tab Strip ───────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-1 bg-slate-50/50 px-1 pt-1">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 border-b-transparent rounded-t-[3px] text-xs font-semibold text-slate-800 shadow-xs -mb-[1px]"
        >
          <CornerUpRight className="w-3.5 h-3.5 text-slate-700" />
          <span>Convert Lead</span>
        </button>
      </div>

      {/* ── Main Convert Form ──────────────────────────────────────── */}
      <form onSubmit={handleConvertSubmit} className="space-y-4">
        
        {/* Owner Selector Bar */}
        <div className="bg-white border border-slate-200 rounded-[3px] shadow-xs p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 text-xs sm:text-[13px]">
            <label className="sm:col-span-2 text-slate-700 font-normal">
              Owner
            </label>
            <div className="sm:col-span-10 max-w-md relative flex items-center border border-slate-300 rounded-[3px] bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="avatar"
                className="w-4 h-4 rounded-full object-cover mr-2 flex-shrink-0"
              />
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="JISMON JOSE">JISMON JOSE</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Jordan Hayes">Jordan Hayes</option>
                <option value="Mohammed Rashid">Mohammed Rashid</option>
              </select>
              <span className="absolute right-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {/* ── CARD 1: Contact Details ────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-[3px] shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#f1f3f7] border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs sm:text-[13px] font-bold text-slate-800">Contact Details</h2>
          </div>

          <div className="p-4 sm:p-5 text-xs sm:text-[13px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-3.5 gap-x-12">
              
              {/* Left Column */}
              <div className="space-y-3.5">
                {/* Contact Name ✓ */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1">
                    <span>Contact Name</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  </label>
                  <div className="sm:col-span-8 flex items-center border border-emerald-500/80 rounded-[3px] bg-white overflow-hidden shadow-2xs focus-within:ring-1 focus-within:ring-emerald-500">
                    <select
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value)}
                      className="bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-medium uppercase focus:outline-none"
                    />
                  </div>
                </div>

                {/* Source */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Source</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={contactSource}
                      onChange={(e) => setContactSource(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="Website Inbound">Website Inbound</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Direct Inquiry">Direct Inquiry</option>
                      <option value="Directory">Directory</option>
                      <option value="Referral">Referral</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Business Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-orange-500 rounded-xs inline-block" />
                    <span>Business Mobile</span>
                  </label>
                  <div className="sm:col-span-8 flex items-center border border-slate-300 rounded-[3px] bg-white overflow-hidden shadow-2xs focus-within:border-[#006f8e]">
                    <div className="flex items-center gap-1 bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs">
                      <span>🇦🇪</span>
                      <select
                        value={businessCountryCode}
                        onChange={(e) => setBusinessCountryCode(e.target.value)}
                        className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="+971">+971</option>
                        <option value="+968">+968</option>
                        <option value="+966">+966</option>
                        <option value="+91">+91</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={businessMobile}
                      onChange={(e) => setBusinessMobile(e.target.value)}
                      className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-500" />
                    <span>Email</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Add multiple emails by pressing Tab button."
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Nationality</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={contactNationality}
                      onChange={(e) => setContactNationality(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Oman">Oman</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Spoken Language */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Spoken Language</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={spokenLanguage}
                      onChange={(e) => setSpokenLanguage(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Hindi / Urdu">Hindi / Urdu</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3.5">
                {/* Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Designation</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="Managing Director">Managing Director</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Procurement Manager">Procurement Manager</option>
                      <option value="Project Engineer">Project Engineer</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Source Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Source Name</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={contactSourceName}
                      onChange={(e) => setContactSourceName(e.target.value)}
                      placeholder="Name of the source. Eg Google, LinkedIn"
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Personal Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-orange-500 rounded-xs inline-block" />
                    <span>Personal Mobile</span>
                  </label>
                  <div className="sm:col-span-8 flex items-center border border-slate-300 rounded-[3px] bg-white overflow-hidden shadow-2xs focus-within:border-[#006f8e]">
                    <div className="flex items-center gap-1 bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs">
                      <span>🇦🇪</span>
                      <select
                        value={personalCountryCode}
                        onChange={(e) => setPersonalCountryCode(e.target.value)}
                        className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="+971">+971</option>
                        <option value="+968">+968</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={personalMobile}
                      onChange={(e) => setPersonalMobile(e.target.value)}
                      className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#006f8e]" />
                    <span>Address</span>
                  </label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={2}
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      placeholder="PO Box, Street, City etc..."
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* State/Region */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">State/Region</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={contactState}
                      onChange={(e) => setContactState(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal pt-1.5">Comments</label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={2}
                      value={contactComments}
                      onChange={(e) => setContactComments(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── CARD 2: Customer Details ───────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-[3px] shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#f1f3f7] border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs sm:text-[13px] font-bold text-slate-800">Customer Details</h2>
          </div>

          <div className="p-4 sm:p-5 text-xs sm:text-[13px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-3.5 gap-x-12">
              
              {/* Left Column */}
              <div className="space-y-3.5">
                {/* Customer Name * */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-medium uppercase focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Parent Customer */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Parent Customer</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={parentCustomer}
                      onChange={(e) => setParentCustomer(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="EMAAR PROPERTIES PJSC">EMAAR PROPERTIES PJSC</option>
                      <option value="AL FUTTAIM GROUP">AL FUTTAIM GROUP</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Source */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Source</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={custSource}
                      onChange={(e) => setCustSource(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="Website Inbound">Website Inbound</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Direct Inquiry">Direct Inquiry</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Key Customer? */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Key Customer?</label>
                  <div className="sm:col-span-8 flex items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="keyCust"
                        checked={isKeyCustomer}
                        onChange={() => setIsKeyCustomer(true)}
                        className="text-[#006f8e]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="keyCust"
                        checked={!isKeyCustomer}
                        onChange={() => setIsKeyCustomer(false)}
                        className="text-[#006f8e]"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* No. of Employees */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">No. of Employees</label>
                  <div className="sm:col-span-8">
                    <input
                      type="number"
                      value={numEmployees}
                      onChange={(e) => setNumEmployees(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-500" />
                    <span>Email</span>
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="email"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="Add multiple emails by pressing Tab button."
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#006f8e]" />
                    <span>Address</span>
                  </label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={2}
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder="Office No, PO Box, Street, City etc..."
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* State/Region */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">State/Region</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={custState}
                      onChange={(e) => setCustState(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Sharjah">Sharjah</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal pt-1.5">Comments</label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={2}
                      value={custComments}
                      onChange={(e) => setCustComments(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* TRN */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">TRN</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={trn}
                      onChange={(e) => setTrn(e.target.value)}
                      placeholder="100XXXXXXXXX"
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3.5">
                {/* Industry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Industry Type</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={industryType}
                      onChange={(e) => setIndustryType(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="HVAC & MEP Contracting">HVAC & MEP Contracting</option>
                      <option value="Trading & Distribution">Trading & Distribution</option>
                      <option value="Facilities Management">Facilities Management</option>
                      <option value="Construction & Engineering">Construction & Engineering</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Customer Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Customer Tags</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={customerTags}
                      onChange={(e) => setCustomerTags(e.target.value)}
                      placeholder="Select / enter tags"
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Source Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Source Name</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={custSourceName}
                      onChange={(e) => setCustSourceName(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Campaign ? */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1">
                    <span>Campaign</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
                  </label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={custCampaign}
                      onChange={(e) => setCustCampaign(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Select</option>
                      <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                      <option value="GOOGLE AD 2025">GOOGLE AD 2025</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Tel */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#006f8e]" />
                    <span>Tel</span>
                  </label>
                  <div className="sm:col-span-8 flex items-center border border-slate-300 rounded-[3px] bg-white overflow-hidden shadow-2xs focus-within:border-[#006f8e]">
                    <div className="flex items-center gap-1 bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs">
                      <span>🇦🇪</span>
                      <select
                        value={telCountryCode}
                        onChange={(e) => setTelCountryCode(e.target.value)}
                        className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="+971">+971</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={custTel}
                      onChange={(e) => setCustTel(e.target.value)}
                      className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Website</label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={custWebsite}
                      onChange={(e) => setCustWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Country</label>
                  <div className="sm:col-span-8 relative">
                    <select
                      value={custCountry}
                      onChange={(e) => setCustCountry(e.target.value)}
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                    >
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Oman">Oman</option>
                    </select>
                    <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Location</label>
                  <div className="sm:col-span-8 relative flex items-center">
                    <input
                      type="text"
                      value={custLocation}
                      onChange={(e) => setCustLocation(e.target.value)}
                      placeholder="Search location"
                      className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] pr-8 focus:outline-none focus:border-[#006f8e] shadow-2xs"
                    />
                    <span className="absolute right-2.5 text-slate-400 text-xs pointer-events-none">⊗</span>
                  </div>
                </div>

                {/* Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Logo</label>
                  <div className="sm:col-span-8 flex items-center gap-2">
                    <input
                      type="file"
                      id="logo-upload"
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-[2px] file:border file:border-slate-300 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                </div>

                {/* Is Supplier? */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                  <label className="sm:col-span-4 text-slate-700 font-normal">Is Supplier?</label>
                  <div className="sm:col-span-8">
                    <input
                      type="checkbox"
                      checked={isSupplier}
                      onChange={(e) => setIsSupplier(e.target.checked)}
                      className="w-4 h-4 text-[#006f8e] rounded border-slate-300"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── CARD 3: Opportunity Details Checkbox & Section ──────────── */}
        <div className="space-y-2">
          {/* Checkbox */}
          <label className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#006f8e] cursor-pointer">
            <input
              type="checkbox"
              checked={includeOpportunity}
              onChange={(e) => setIncludeOpportunity(e.target.checked)}
              className="w-4 h-4 text-[#006f8e] rounded border-slate-300 cursor-pointer"
            />
            <span>Add opportunity for this lead.</span>
          </label>

          {includeOpportunity && (
            <div className="bg-white border border-slate-200 rounded-[3px] shadow-xs overflow-hidden animate-in fade-in duration-150">
              {/* Card Header */}
              <div className="bg-[#f1f3f7] border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <h2 className="text-xs sm:text-[13px] font-bold text-slate-800">Opportunity</h2>
              </div>

              <div className="p-4 sm:p-5 text-xs sm:text-[13px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-3.5 gap-x-12">
                  
                  {/* Left Column */}
                  <div className="space-y-3.5">
                    {/* Opportunity Title * */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">
                        Opportunity Title <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          required={includeOpportunity}
                          value={oppTitle}
                          onChange={(e) => setOppTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Opportunity Number * */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">
                        Opportunity Number <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          disabled
                          value={oppNumber}
                          className="w-full border border-slate-200 rounded-[3px] bg-slate-100/70 px-3 py-1.5 text-slate-600 text-xs sm:text-[13px] font-mono shadow-2xs cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Source */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Source</label>
                      <div className="sm:col-span-8 relative">
                        <select
                          value={oppSource}
                          onChange={(e) => setOppSource(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                        >
                          <option value="Select Source">Select Source</option>
                          <option value="Website Inbound">Website Inbound</option>
                          <option value="Google Ads">Google Ads</option>
                          <option value="Direct Inquiry">Direct Inquiry</option>
                        </select>
                        <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Rating</label>
                      <div className="sm:col-span-8 flex items-center gap-1 flex-wrap">
                        {(['Cold', 'Warm', 'Hot'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setOppRating(r)}
                            className={cn(
                              'px-2.5 py-1 text-xs rounded-[2px] transition-colors border shadow-2xs font-semibold cursor-pointer',
                              oppRating.toLowerCase() === r.toLowerCase()
                                ? 'bg-[#337ab7] text-white border-[#2e6da4]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            )}
                          >
                            {r.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stage */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Stage</label>
                      <div className="sm:col-span-8 relative">
                        <select
                          value={oppStage}
                          onChange={(e) => setOppStage(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                        >
                          <option value="Enquiry">Enquiry</option>
                          <option value="Opportunity">Opportunity</option>
                          <option value="Quotation">Quotation</option>
                          <option value="Negotiation">Negotiation</option>
                        </select>
                        <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                      </div>
                    </div>

                    {/* Business Opportunity */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Business Opportunity</label>
                      <div className="sm:col-span-8 relative">
                        <select
                          value={oppBusinessOpportunity}
                          onChange={(e) => setOppBusinessOpportunity(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                        >
                          <option value="">Select Business Opportunity</option>
                          <option value="HVAC Installation">HVAC Installation</option>
                          <option value="Commercial Construction">Commercial Construction</option>
                          <option value="Industrial Fittings">Industrial Fittings</option>
                        </select>
                        <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                      </div>
                    </div>

                    {/* LPO Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">LPO Number</label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={lpoNumber}
                          onChange={(e) => setLpoNumber(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Next Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal pt-1.5">Next Action</label>
                      <div className="sm:col-span-8">
                        <textarea
                          rows={2}
                          value={nextAction}
                          onChange={(e) => setNextAction(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Delivery Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Delivery Date</label>
                      <div className="sm:col-span-8 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                        <input
                          type="text"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          placeholder="DD-MM-YYYY"
                          className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none"
                        />
                        <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3.5">
                    {/* Opportunity Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Opportunity Date</label>
                      <div className="sm:col-span-8 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                        <input
                          type="text"
                          value={oppDate}
                          onChange={(e) => setOppDate(e.target.value)}
                          className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none"
                        />
                        <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>

                    {/* Opportunity Tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Opportunity Tags</label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={oppTags}
                          onChange={(e) => setOppTags(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Source Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Source Name</label>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={oppSourceName}
                          onChange={(e) => setOppSourceName(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Close Date * */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">
                        Close Date <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-8 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                        <input
                          type="date"
                          required={includeOpportunity}
                          value={oppCloseDate}
                          onChange={(e) => setOppCloseDate(e.target.value)}
                          className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Amount (AED)</label>
                      <div className="sm:col-span-8">
                        <input
                          type="number"
                          value={oppAmount}
                          onChange={(e) => setOppAmount(e.target.value)}
                          placeholder="AED"
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-semibold focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal pt-1.5">Comments</label>
                      <div className="sm:col-span-8">
                        <textarea
                          rows={2}
                          value={oppComments}
                          onChange={(e) => setOppComments(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* LPO Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">LPO Date</label>
                      <div className="sm:col-span-8 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                        <input
                          type="text"
                          value={lpoDate}
                          onChange={(e) => setLpoDate(e.target.value)}
                          placeholder="DD-MM-YYYY"
                          className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none"
                        />
                        <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                      </div>
                    </div>

                    {/* Competitors Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal pt-1.5">Competitors Details</label>
                      <div className="sm:col-span-8">
                        <textarea
                          rows={2}
                          value={competitorsDetails}
                          onChange={(e) => setCompetitorsDetails(e.target.value)}
                          className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Win Probability Slider */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-3">
                      <label className="sm:col-span-4 text-slate-700 font-normal">Win Probability</label>
                      <div className="sm:col-span-8 flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={winProbability}
                          onChange={(e) => setWinProbability(Number(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer"
                        />
                        <span className="px-2.5 py-1 bg-orange-500 text-white font-bold text-xs rounded-[3px] flex-shrink-0 min-w-[45px] text-center shadow-xs">
                          {winProbability}%
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Action Buttons (Bottom Right) ──────────────────────────── */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[3px] bg-[#004b6e] hover:bg-[#003b57] text-white text-xs sm:text-[13px] font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <CornerUpRight className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Converting...' : 'Convert'}</span>
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[3px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs sm:text-[13px] font-medium transition-colors shadow-xs cursor-pointer"
          >
            <span className="text-[10px]">◀</span>
            <span>Back</span>
          </button>
        </div>
      </form>
    </div>
  );
}
