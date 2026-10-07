'use client';

import React, { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileEdit,
  X,
  Calendar,
  Check,
  HelpCircle,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Search,
  Globe,
  Tag,
  Building2,
  Briefcase,
  User,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditLeadPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { leads, updateLead, campaigns, users } = useEnterpriseCrm();

  const getEmployeePhoto = (name?: string): string | null => {
    if (!name) return null;
    const clean = name.trim().toLowerCase();

    const matchedUser = users.find((u) => u.name && u.name.trim().toLowerCase() === clean);
    if (matchedUser?.avatar && !matchedUser.avatar.includes('photo-1507003211169-0a1dd7228f2d')) {
      return matchedUser.avatar;
    }

    if (typeof window !== 'undefined') {
      try {
        const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
        if (storedUsersRaw) {
          const parsed = JSON.parse(storedUsersRaw);
          if (Array.isArray(parsed)) {
            const found = parsed.find(
              (u: any) =>
                (u.name && u.name.trim().toLowerCase() === clean) ||
                (u.username && u.username.trim().toLowerCase() === clean) ||
                (u.email && u.email.trim().toLowerCase() === clean)
            );
            if (found && (found.avatarImage || found.avatarUrl || found.avatar)) {
              return found.avatarImage || found.avatarUrl || found.avatar;
            }
          }
        }

        const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
        if (storedAdminsRaw) {
          const parsedAdmins = JSON.parse(storedAdminsRaw);
          if (Array.isArray(parsedAdmins)) {
            const foundAdmin = parsedAdmins.find(
              (a: any) =>
                (a.name && a.name.trim().toLowerCase() === clean) ||
                (a.email && a.email.trim().toLowerCase() === clean)
            );
            if (foundAdmin && (foundAdmin.avatar || foundAdmin.avatarUrl || foundAdmin.avatarImage)) {
              return foundAdmin.avatar || foundAdmin.avatarUrl || foundAdmin.avatarImage;
            }
          }
        }
      } catch (e) {
        console.error('getEmployeePhoto error:', e);
      }
    }
    return null;
  };

  const renderUserAvatar = (name: string, explicitAvatar?: string, size = 'w-5 h-5') => {
    const isMockMan = explicitAvatar?.includes('photo-1507003211169-0a1dd7228f2d');
    const photo = (!isMockMan && explicitAvatar) || getEmployeePhoto(name);

    if (photo) {
      return (
        <img
          src={photo}
          alt={name}
          title={name}
          className={`${size} rounded-full object-cover border border-slate-300 flex-shrink-0 shadow-2xs mr-2`}
        />
      );
    }

    const initials = (name || 'U')
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

    return (
      <div
        title={name}
        className={`${size} rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px] flex-shrink-0 border border-slate-300 shadow-2xs mr-2`}
      >
        {initials}
      </div>
    );
  };

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
        assignedDate: '',
        leadAssigned: {
          name: 'JISMON JOSE',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        contactDetails: {
          salutation: 'Mr.',
          name: 'WAQUAR',
          phone: '971581941460',
          personalMobile: '',
          telephone: '',
          company: 'URUGUAY GENERAL TRADING',
          email: '',
          website: '',
          designation: '',
          nationality: '',
        },
        leadSpecification: 'Supply & Installation of 25-Ton Rooftop Package Units for Warehouse',
        createdBy: 'JISMON JOSE',
        owner: 'JISMON JOSE',
        rating: 'Cold' as LeadRating,
        status: 'Contacted' as LeadStatus,
        lastActivity: '21-09-2026 5:57:27 PM',
        value: 85000,
        source: 'Select',
        sourceName: '',
        campaign: 'Select',
        businessOpportunity: 'Select',
        location: '',
        comments: 'PROVIDED PRICE FOR SUPER GENERAL PORTABLE AC - SGP204T3',
      }
    );
  }, [leads, resolvedParams.id]);

  // Dynamic Assignable Users List
  const assignableUsers = useMemo(() => {
    let deletedIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const delRaw = localStorage.getItem('cezcon_crm_deleted_user_ids');
        if (delRaw) deletedIds = JSON.parse(delRaw);
      } catch (e) {}
    }

    const userMap = new Map<string, { id: string; name: string; role: string; department?: string; avatar?: string }>();

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: any) => {
              const uId = String(u.id || '');
              if (deletedIds.includes(uId) || deletedIds.includes(`usr_${uId}`) || deletedIds.includes(uId.replace('usr_', ''))) {
                return;
              }
              const name = u.name?.trim() || u.username?.trim();
              if (name && !userMap.has(name.toLowerCase())) {
                userMap.set(name.toLowerCase(), {
                  id: uId || `usr_${name.toLowerCase()}`,
                  name,
                  role: u.profileType || u.employeeType || u.designation || 'Staff',
                  department: u.department || u.managerType || '',
                  avatar: u.avatarImage || u.avatarUrl || u.avatar,
                });
              }
            });
          }
        }
      } catch (e) {}
    }

    users.forEach((u) => {
      if (u.name && !userMap.has(u.name.toLowerCase())) {
        userMap.set(u.name.toLowerCase(), {
          id: u.id,
          name: u.name,
          role: u.role || 'Sales Representative',
          department: u.department,
          avatar: u.avatar,
        });
      }
    });

    const fallbacks = [
      { id: 'usr_shaheer', name: 'Shaheer', role: 'Sales Executive' },
      { id: 'usr_shibil', name: 'Muhammed Shibil', role: 'Sales Manager' },
      { id: 'usr_jismon', name: 'JISMON JOSE', role: 'Sales Executive' },
      { id: 'usr_ahsan', name: 'MUHAMMED AHSAN P V', role: 'Sales Executive' },
      { id: 'usr_adhil', name: 'Muhammed Adhil', role: 'Sales Executive' },
      { id: 'usr_afsal', name: 'Afsal', role: 'Marketing Manager' },
      { id: 'usr_arun', name: 'Arun', role: 'Marketing Executive' },
      { id: 'usr_shameem', name: 'Shameem', role: 'Marketing Executive' },
      { id: 'usr_rashid', name: 'Mohammed Rashid', role: 'Purchase Manager' },
    ];

    fallbacks.forEach((f) => {
      if (!userMap.has(f.name.toLowerCase())) {
        userMap.set(f.name.toLowerCase(), f);
      }
    });

    return Array.from(userMap.values());
  }, [users]);

  // Form State
  const [owner, setOwner] = useState(lead.owner || 'JISMON JOSE');
  const [assignedEmployee, setAssignedEmployee] = useState(
    lead.assignedEmployee || lead.leadAssigned?.name || lead.owner || 'JISMON JOSE'
  );
  const [leadDate, setLeadDate] = useState(lead.leadDate || '21-09-2026');
  const [salutation, setSalutation] = useState(lead.contactDetails.salutation || 'Mr.');
  const [contactName, setContactName] = useState(
    lead.contactDetails.name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Eng\.)\s*/i, '') || 'WAQUAR'
  );
  const [designation, setDesignation] = useState(lead.contactDetails.designation || '');
  
  // Mobile / Phone with Country Codes
  const [businessCountryCode, setBusinessCountryCode] = useState('+971');
  const [businessMobile, setBusinessMobile] = useState(
    lead.contactDetails.phone.replace(/^\+971|\+968|\+966|\+91|\+1/g, '').replace(/[^0-9]/g, '') || '971581941460'
  );
  
  const [personalCountryCode, setPersonalCountryCode] = useState('+971');
  const [personalMobile, setPersonalMobile] = useState(lead.contactDetails.personalMobile || '');

  const [email, setEmail] = useState(lead.contactDetails.email || '');
  const [nationality, setNationality] = useState(lead.contactDetails.nationality || '');
  
  const [customerName, setCustomerName] = useState(lead.contactDetails.company || 'URUGUAY GENERAL TRADING');
  
  const [telCountryCode, setTelCountryCode] = useState('+971');
  const [landline, setLandline] = useState(lead.contactDetails.telephone || '');

  const [website, setWebsite] = useState(lead.contactDetails.website || '');
  const [leadTags, setLeadTags] = useState(lead.tags?.join(', ') || '');

  const [campaign, setCampaign] = useState(lead.campaign || '');
  const [source, setSource] = useState(lead.source || '');
  const [sourceName, setSourceName] = useState(lead.sourceName || '');

  const [rating, setRating] = useState<'Cold' | 'Warm' | 'Hot'>(
    (lead.rating as 'Cold' | 'Warm' | 'Hot') || 'Cold'
  );
  const [status, setStatus] = useState<string>(lead.status || 'Contacted');
  const [businessOpportunity, setBusinessOpportunity] = useState(lead.businessOpportunity || '');
  const [location, setLocation] = useState(lead.location || '');
  const [comments, setComments] = useState(
    lead.comments || 'PROVIDED PRICE FOR SUPER GENERAL PORTABLE AC - SGP204T3'
  );

  const COUNTRY_DIAL_RULES: Record<string, { minDigits: number; maxDigits: number; label: string; placeholder: string }> = {
    '+971': { minDigits: 9, maxDigits: 9, label: 'UAE', placeholder: '50 123 4567' },
    '+966': { minDigits: 9, maxDigits: 9, label: 'Saudi Arabia', placeholder: '50 123 4567' },
    '+968': { minDigits: 8, maxDigits: 8, label: 'Oman', placeholder: '9123 4567' },
    '+974': { minDigits: 8, maxDigits: 8, label: 'Qatar', placeholder: '3312 3456' },
    '+965': { minDigits: 8, maxDigits: 8, label: 'Kuwait', placeholder: '9123 4567' },
    '+973': { minDigits: 8, maxDigits: 8, label: 'Bahrain', placeholder: '3612 3456' },
    '+91': { minDigits: 10, maxDigits: 10, label: 'India', placeholder: '98765 43210' },
    '+92': { minDigits: 10, maxDigits: 10, label: 'Pakistan', placeholder: '300 1234567' },
    '+44': { minDigits: 10, maxDigits: 11, label: 'UK', placeholder: '7123 456789' },
    '+1': { minDigits: 10, maxDigits: 10, label: 'USA', placeholder: '555 123 4567' },
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const validateEditForm = () => {
    const errors: Record<string, string> = {};

    if (!contactName.trim()) {
      errors.contactName = 'Contact Name is required';
    } else if (contactName.trim().length < 2) {
      errors.contactName = 'Contact Name must be at least 2 characters';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (businessMobile.trim()) {
      const cleanDigits = businessMobile.replace(/\D/g, '');
      const rule = COUNTRY_DIAL_RULES[businessCountryCode] || { minDigits: 7, maxDigits: 15, label: 'Country' };
      if (cleanDigits.length < rule.minDigits || cleanDigits.length > rule.maxDigits) {
        errors.businessMobile = `${rule.label} (${businessCountryCode}) requires ${rule.minDigits === rule.maxDigits ? `${rule.minDigits} digits` : `${rule.minDigits}-${rule.maxDigits} digits`} (entered: ${cleanDigits.length})`;
      }
    }

    if (personalMobile.trim()) {
      const cleanDigits = personalMobile.replace(/\D/g, '');
      const rule = COUNTRY_DIAL_RULES[personalCountryCode] || { minDigits: 7, maxDigits: 15, label: 'Country' };
      if (cleanDigits.length < rule.minDigits || cleanDigits.length > rule.maxDigits) {
        errors.personalMobile = `${rule.label} (${personalCountryCode}) requires ${rule.minDigits === rule.maxDigits ? `${rule.minDigits} digits` : `${rule.minDigits}-${rule.maxDigits} digits`} (entered: ${cleanDigits.length})`;
      }
    }

    if (landline.trim()) {
      const cleanDigits = landline.replace(/\D/g, '');
      if (cleanDigits.length < 6 || cleanDigits.length > 12) {
        errors.landline = `Landline requires between 6 and 12 digits (entered: ${cleanDigits.length})`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submit handler
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm()) {
      return;
    }

    const cleanBiz = businessMobile.replace(/\D/g, '');
    const cleanPers = personalMobile.replace(/\D/g, '');
    const cleanTel = landline.replace(/\D/g, '');

    const formattedPhone = cleanBiz ? `${businessCountryCode} ${cleanBiz}` : (cleanPers ? `${personalCountryCode} ${cleanPers}` : lead.contactDetails.phone);
    const formattedPersonal = cleanPers ? `${personalCountryCode} ${cleanPers}` : '';
    const formattedTel = cleanTel ? `${telCountryCode} ${cleanTel}` : '';

    const assigneePhoto = getEmployeePhoto(assignedEmployee) || '';
    const ownerPhoto = getEmployeePhoto(owner) || '';

    updateLead(lead.id, {
      owner,
      ownerAvatar: ownerPhoto,
      assignedEmployee,
      leadAssigned: {
        name: assignedEmployee,
        avatar: assigneePhoto,
      },
      assignedDate: lead.assignedDate || leadDate,
      leadDate,
      contactDetails: {
        ...lead.contactDetails,
        salutation,
        name: `${salutation} ${contactName.trim()}`,
        phone: formattedPhone,
        personalMobile: formattedPersonal,
        telephone: formattedTel,
        company: customerName,
        email: email.trim(),
        website,
        designation,
        nationality,
        whatsapp: formattedPhone,
      },
      campaign,
      source,
      sourceName,
      rating: rating as LeadRating,
      status: status as LeadStatus,
      businessOpportunity,
      location,
      comments,
      tags: leadTags ? leadTags.split(',').map((t) => t.trim()).filter(Boolean) : lead.tags,
      lastActivity: `${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} ${new Date().toLocaleTimeString()}`,
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push(`/leads/${lead.id}`);
    }, 400);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full max-w-full space-y-3 pb-16">
      {/* ── 1. Top Header Strip ─────────────────────────────────────── */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-[3px] shadow-xs px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileEdit className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[2]" />
          <h1 className="text-xs sm:text-sm font-bold text-[#1e293b] tracking-wide truncate">
            Edit Lead
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

      {/* ── 2. Subnav Tab Strip ────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-1 bg-slate-50/50 px-1 pt-1">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 border-b-transparent rounded-t-[3px] text-xs font-semibold text-slate-800 shadow-xs -mb-[1px]"
        >
          <FileEdit className="w-3.5 h-3.5 text-slate-700" />
          <span>Edit Lead</span>
        </button>
      </div>

      {/* ── 3. Main Edit Form Card ─────────────────────────────────── */}
      <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-[3px] shadow-xs p-4 sm:p-6 text-xs sm:text-[13px]">
        {/* Responsive 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-12">
          
          {/* ════════ LEFT COLUMN ════════ */}
          <div className="space-y-4">
            
            {/* 1. Lead Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Lead Owner
              </label>
              <div className="sm:col-span-8">
                <div className="relative flex items-center border border-slate-300 rounded-[3px] bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                  {renderUserAvatar(owner)}
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                    {owner && !assignableUsers.some((u) => u.name === owner) && (
                      <option value={owner}>{owner}</option>
                    )}
                  </select>
                  <span className="absolute right-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* 1b. Assigned Representative */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4 bg-blue-50/40 p-2 rounded border border-blue-100">
              <label className="sm:col-span-4 text-blue-900 font-semibold flex items-center gap-1">
                <span>Assigned To</span>
              </label>
              <div className="sm:col-span-8">
                <div className="relative flex items-center border border-blue-300 rounded-[3px] bg-white px-2.5 py-1.5 focus-within:border-blue-600 shadow-2xs">
                  {renderUserAvatar(assignedEmployee)}
                  <select
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-bold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                    {assignedEmployee && !assignableUsers.some((u) => u.name === assignedEmployee) && (
                      <option value={assignedEmployee}>{assignedEmployee}</option>
                    )}
                  </select>
                  <span className="absolute right-2.5 pointer-events-none text-blue-600 text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* 2. Contact Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1 pt-1.5">
                <span>Contact Name</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="sm:col-span-8">
                <div className={cn(
                  "flex items-center border rounded-[3px] bg-white overflow-hidden shadow-2xs transition-colors",
                  formErrors.contactName ? "border-red-500 bg-red-50/20" : "border-slate-300 focus-within:border-[#006f8e]"
                )}>
                  <select
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs sm:text-[13px] focus:outline-none cursor-pointer"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Eng.">Eng.</option>
                  </select>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      if (formErrors.contactName) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.contactName;
                          return copy;
                        });
                      }
                    }}
                    placeholder="Enter Contact Name"
                    className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-medium uppercase focus:outline-none"
                  />
                </div>
                {formErrors.contactName && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {formErrors.contactName}</p>
                )}
              </div>
            </div>

            {/* 3. Business Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                <span className="w-1.5 h-3 bg-orange-500 rounded-xs inline-block" />
                <span>Business Mobile</span>
              </label>
              <div className="sm:col-span-8">
                <div className={cn(
                  "flex items-center border rounded-[3px] bg-white overflow-hidden shadow-2xs transition-colors",
                  formErrors.businessMobile ? "border-red-500 bg-red-50/20" : "border-slate-300 focus-within:border-[#006f8e]"
                )}>
                  <div className="flex items-center gap-1 bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs">
                    <select
                      value={businessCountryCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const rule = COUNTRY_DIAL_RULES[newCode] || { maxDigits: 15 };
                        setBusinessCountryCode(newCode);
                        setBusinessMobile(businessMobile.replace(/\D/g, '').slice(0, rule.maxDigits));
                        if (formErrors.businessMobile) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.businessMobile;
                            return copy;
                          });
                        }
                      }}
                      className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={(COUNTRY_DIAL_RULES[businessCountryCode] || { maxDigits: 15 }).maxDigits}
                    value={businessMobile}
                    onChange={(e) => {
                      const maxD = (COUNTRY_DIAL_RULES[businessCountryCode] || { maxDigits: 15 }).maxDigits;
                      setBusinessMobile(e.target.value.replace(/\D/g, '').slice(0, maxD));
                      if (formErrors.businessMobile) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.businessMobile;
                          return copy;
                        });
                      }
                    }}
                    placeholder={(COUNTRY_DIAL_RULES[businessCountryCode] || { placeholder: 'Mobile number' }).placeholder}
                    className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none"
                  />
                </div>
                {formErrors.businessMobile && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {formErrors.businessMobile}</p>
                )}
              </div>
            </div>

            {/* 4. Email */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <span>Email</span>
              </label>
              <div className="sm:col-span-8">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.email;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. client@company.com"
                  className={cn(
                    "w-full border rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] placeholder:text-slate-400 placeholder:text-xs focus:outline-none shadow-2xs transition-colors",
                    formErrors.email ? "border-red-500 bg-red-50/20 focus:border-red-500" : "border-slate-300 focus:border-[#006f8e]"
                  )}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {formErrors.email}</p>
                )}
              </div>
            </div>

            {/* 5. Customer Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Customer Name
              </label>
              <div className="sm:col-span-8">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Company / Customer Name"
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-medium uppercase focus:outline-none focus:border-[#006f8e] shadow-2xs"
                />
              </div>
            </div>

            {/* 6. Website */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Website
              </label>
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                />
              </div>
            </div>

            {/* 7. Campaign */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1">
                <span>Campaign</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
              </label>
              <div className="sm:col-span-8 relative">
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                >
                  <option value="">Select</option>
                  <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                  <option value="GOOGLE AD 2025">GOOGLE AD 2025</option>
                  <option value="YELLOW PAGES-UAE.COM - 2025">YELLOW PAGES-UAE.COM - 2025</option>
                  <option value="DIRECT - 2026">DIRECT - 2026</option>
                </select>
                <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
              </div>
            </div>

            {/* 8. Source Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Source Name
              </label>
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="Name of the source. Eg Google, LinkedIn"
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:border-[#006f8e] shadow-2xs"
                />
              </div>
            </div>

            {/* 9. Status Segmented Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Status
              </label>
              <div className="sm:col-span-8 flex items-center gap-1 flex-wrap">
                {['Pending', 'Contacted', 'Disqualified'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-[2px] transition-colors border shadow-2xs cursor-pointer',
                      status.toLowerCase() === st.toLowerCase()
                        ? 'bg-[#337ab7] text-white border-[#2e6da4] font-medium'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 10. Location Search */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#006f8e]" />
                <span>Location</span>
              </label>
              <div className="sm:col-span-8 relative flex items-center">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search location"
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] pr-8 focus:outline-none focus:border-[#006f8e] shadow-2xs"
                />
                {location ? (
                  <button
                    type="button"
                    onClick={() => setLocation('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="absolute right-2.5 text-slate-400 text-xs pointer-events-none">⊗</span>
                )}
              </div>
            </div>

          </div>

          {/* ════════ RIGHT COLUMN ════════ */}
          <div className="space-y-4">
            
            {/* 1. Lead Date */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Lead Date
              </label>
              <div className="sm:col-span-8">
                <DatePicker
                  value={leadDate}
                  onChange={(val) => setLeadDate(val)}
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            {/* 2. Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Designation
              </label>
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
                  <option value="Purchase Officer">Purchase Officer</option>
                  <option value="Project Engineer">Project Engineer</option>
                  <option value="MEP Consultant">MEP Consultant</option>
                </select>
                <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
              </div>
            </div>

            {/* 3. Personal Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                <span className="w-1.5 h-3 bg-orange-500 rounded-xs inline-block" />
                <span>Personal Mobile</span>
              </label>
              <div className="sm:col-span-8">
                <div className={cn(
                  "flex items-center border rounded-[3px] bg-white overflow-hidden shadow-2xs transition-colors",
                  formErrors.personalMobile ? "border-red-500 bg-red-50/20" : "border-slate-300 focus-within:border-[#006f8e]"
                )}>
                  <div className="flex items-center gap-1 bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs">
                    <select
                      value={personalCountryCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const rule = COUNTRY_DIAL_RULES[newCode] || { maxDigits: 15 };
                        setPersonalCountryCode(newCode);
                        setPersonalMobile(personalMobile.replace(/\D/g, '').slice(0, rule.maxDigits));
                        if (formErrors.personalMobile) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.personalMobile;
                            return copy;
                          });
                        }
                      }}
                      className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={(COUNTRY_DIAL_RULES[personalCountryCode] || { maxDigits: 15 }).maxDigits}
                    value={personalMobile}
                    onChange={(e) => {
                      const maxD = (COUNTRY_DIAL_RULES[personalCountryCode] || { maxDigits: 15 }).maxDigits;
                      setPersonalMobile(e.target.value.replace(/\D/g, '').slice(0, maxD));
                      if (formErrors.personalMobile) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.personalMobile;
                          return copy;
                        });
                      }
                    }}
                    placeholder={(COUNTRY_DIAL_RULES[personalCountryCode] || { placeholder: 'Personal mobile' }).placeholder}
                    className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none"
                  />
                </div>
                {formErrors.personalMobile && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {formErrors.personalMobile}</p>
                )}
              </div>
            </div>

            {/* 4. Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Nationality
              </label>
              <div className="sm:col-span-8 relative">
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                >
                  <option value="">Select</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Oman">Oman</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Jordan">Jordan</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
                <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
              </div>
            </div>

            {/* 5. Tel (Landline) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                <Phone className="w-3.5 h-3.5 text-[#006f8e]" />
                <span>Tel</span>
              </label>
              <div className="sm:col-span-8">
                <div className={cn(
                  "flex items-center border rounded-[3px] bg-white overflow-hidden shadow-2xs transition-colors",
                  formErrors.landline ? "border-red-500 bg-red-50/20" : "border-slate-300 focus-within:border-[#006f8e]"
                )}>
                  <div className="flex items-center gap-1 bg-slate-50 border-r border-slate-300 px-2 py-1.5 text-slate-700 text-xs">
                    <select
                      value={telCountryCode}
                      onChange={(e) => setTelCountryCode(e.target.value)}
                      className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+91">🇮🇳 +91</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={12}
                    value={landline}
                    onChange={(e) => {
                      setLandline(e.target.value.replace(/\D/g, '').slice(0, 12));
                      if (formErrors.landline) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.landline;
                          return copy;
                        });
                      }
                    }}
                    placeholder="Landline"
                    className="w-full px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] font-mono focus:outline-none"
                  />
                </div>
                {formErrors.landline && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">⚠️ {formErrors.landline}</p>
                )}
              </div>
            </div>

            {/* 6. Lead Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Lead Tags
              </label>
              <div className="sm:col-span-8 relative">
                <input
                  type="text"
                  value={leadTags}
                  onChange={(e) => setLeadTags(e.target.value)}
                  placeholder="Select or enter tags (comma separated)"
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs"
                />
              </div>
            </div>

            {/* 7. Source */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1">
                <span>Source</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
              </label>
              <div className="sm:col-span-8 relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                >
                  <option value="">Select</option>
                  <option value="Website Inbound">Website Inbound</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Direct Inquiry">Direct Inquiry</option>
                  <option value="Directory">Directory</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Referral">Referral</option>
                </select>
                <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
              </div>
            </div>

            {/* 8. Rating Segmented Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal flex items-center gap-1">
                <span>Rating</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
              </label>
              <div className="sm:col-span-8 flex items-center gap-1 flex-wrap">
                {(['Cold', 'Warm', 'Hot'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-[2px] transition-colors border shadow-2xs font-semibold cursor-pointer',
                      rating.toLowerCase() === r.toLowerCase()
                        ? 'bg-[#337ab7] text-white border-[#2e6da4]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 9. Business Opportunity */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal">
                Business Opportunity
              </label>
              <div className="sm:col-span-8 relative">
                <select
                  value={businessOpportunity}
                  onChange={(e) => setBusinessOpportunity(e.target.value)}
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs appearance-none cursor-pointer pr-6"
                >
                  <option value="">Select</option>
                  <option value="HVAC Installation">HVAC Installation</option>
                  <option value="Commercial Construction">Commercial Construction</option>
                  <option value="Industrial Fittings">Industrial Fittings</option>
                  <option value="Preventive Maintenance SLA">Preventive Maintenance SLA</option>
                  <option value="Chiller Replacement">Chiller Replacement</option>
                </select>
                <span className="absolute right-2.5 top-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
              </div>
            </div>

            {/* 10. Comments Textarea */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-1.5 sm:gap-4">
              <label className="sm:col-span-4 text-slate-700 font-normal pt-1.5">
                Comments
              </label>
              <div className="sm:col-span-8">
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments..."
                  className="w-full border border-slate-300 rounded-[3px] bg-white px-3 py-1.5 text-slate-800 text-xs sm:text-[13px] focus:outline-none focus:border-[#006f8e] shadow-2xs resize-y"
                />
              </div>
            </div>

          </div>

        </div>

        {/* ── Action Buttons Bar (Bottom Right) ──────────────────────── */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="submit"
            className="px-5 py-2 rounded-[3px] bg-[#004b6e] hover:bg-[#003b57] text-white text-xs sm:text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
          >
            {isSaved ? 'Updated ✓' : 'Update'}
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
