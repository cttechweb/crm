'use client';

import React, { useState } from 'react';
import {
  Share2,
  Factory,
  Languages,
  CheckCircle2,
  Printer,
  FileText,
  Flag,
  CreditCard,
  ShoppingCart,
  Contact,
  Sliders,
  Plus,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  CEZCON_SOURCES_DATA,
  CEZCON_INDUSTRIES_DATA,
  CEZCON_LANGUAGES_DATA,
  CEZCON_FIELD_CUSTOMISATION_DATA,
  INITIAL_PRINT_MATRIX,
  CEZCON_REPORT_SETTINGS_DATA,
  CEZCON_REGIONS_DATA,
  CEZCON_CUSTOMER_CREDIT_DATA,
  CEZCON_PO_APPROVERS_DATA,
  CEZCON_DESIGNATIONS_DATA,
} from '@/data/settingsMockData';

export function InitialSettingsTab({
  initialSubTab = 'source',
}: {
  initialSubTab?: string;
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  // Sub-tab States
  const [sourcesList, setSourcesList] = useState(CEZCON_SOURCES_DATA);
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceRowsPerPage, setSourceRowsPerPage] = useState(10);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const [industriesList, setIndustriesList] = useState(CEZCON_INDUSTRIES_DATA);
  const [industrySearch, setIndustrySearch] = useState('');
  const [industryRowsPerPage, setIndustryRowsPerPage] = useState(10);
  const [isAddIndustryModalOpen, setIsAddIndustryModalOpen] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');

  const [languagesList] = useState(CEZCON_LANGUAGES_DATA);
  const [customFields] = useState(CEZCON_FIELD_CUSTOMISATION_DATA);
  const [selectedCustomModule, setSelectedCustomModule] = useState<'lead' | 'customer' | 'opportunity' | 'order' | 'invoice'>('lead');
  const [printMatrix] = useState(INITIAL_PRINT_MATRIX);
  const [reportsList] = useState(CEZCON_REPORT_SETTINGS_DATA);
  const [regionsList] = useState(CEZCON_REGIONS_DATA);
  const [creditList] = useState(CEZCON_CUSTOMER_CREDIT_DATA);
  const [designationsList] = useState(CEZCON_DESIGNATIONS_DATA);

  const subTabs = [
    { id: 'source', label: 'Source', icon: Share2 },
    { id: 'industry', label: 'Industry', icon: Factory },
    { id: 'language', label: 'Language', icon: Languages },
    { id: 'customisation', label: 'Field Customisation', icon: CheckCircle2 },
    { id: 'print', label: 'Print Settings', icon: Printer },
    { id: 'reports', label: 'Report Settings', icon: FileText },
    { id: 'region', label: 'Country / Region', icon: Flag },
    { id: 'credit', label: 'Credit Limit', icon: CreditCard },
    { id: 'po', label: 'Purchase Order', icon: ShoppingCart },
    { id: 'designation', label: 'Designation', icon: Contact },
    { id: 'defaults', label: 'Company Defaults', icon: Sliders },
  ];

  const filteredSources = sourcesList.filter((s) =>
    s.name.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredIndustries = industriesList.filter((i) =>
    i.name.toLowerCase().includes(industrySearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 border border-slate-200 rounded-md overflow-x-auto text-xs">
        {subTabs.map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* ── Source Tab ── */}
      {activeSubTab === 'source' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Lead / Customer Sources</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddSourceModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + SOURCE
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 text-xs bg-white">
            <input
              type="text"
              placeholder="Search source..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="w-56 bg-slate-50 border border-slate-200 rounded px-3 py-1 text-xs text-slate-800"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-16">SL.No</th>
                  <th className="py-2.5 px-4">Source Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSources.slice(0, sourceRowsPerPage).map((src, idx) => (
                  <tr key={src.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{src.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Industry Tab ── */}
      {activeSubTab === 'industry' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Factory className="w-4 h-4 text-slate-600" />
              <span>Target Industries</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddIndustryModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + INDUSTRY
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 text-xs bg-white">
            <input
              type="text"
              placeholder="Search industry..."
              value={industrySearch}
              onChange={(e) => setIndustrySearch(e.target.value)}
              className="w-56 bg-slate-50 border border-slate-200 rounded px-3 py-1 text-xs text-slate-800"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-16">SL.No</th>
                  <th className="py-2.5 px-4">Industry Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIndustries.slice(0, industryRowsPerPage).map((ind, idx) => (
                  <tr key={ind.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{ind.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Language Tab ── */}
      {activeSubTab === 'language' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-800">Supported System Languages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-16">SL.No</th>
                  <th className="py-2.5 px-4">Language</th>
                  <th className="py-2.5 px-4">Locale Code</th>
                  <th className="py-2.5 px-4">Direction</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {languagesList.map((lang, idx) => (
                  <tr key={lang.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{lang.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{lang.code}</td>
                    <td className="py-2.5 px-4 text-slate-600">{lang.direction}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lang.status === 'Default' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {lang.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Field Customisation Tab ── */}
      {activeSubTab === 'customisation' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800">Entity Form Field Configuration</h3>
            <div className="flex gap-2 text-xs">
              {(['lead', 'customer', 'opportunity', 'order', 'invoice'] as const).map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedCustomModule(mod)}
                  className={`px-3 py-1 rounded capitalize font-medium ${
                    selectedCustomModule === mod ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-16">SL.No</th>
                  <th className="py-2.5 px-4">Field Name</th>
                  <th className="py-2.5 px-4 text-center w-28">Enabled</th>
                  <th className="py-2.5 px-4 text-center w-28">Mandatory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(customFields[selectedCustomModule] || []).map((f, idx) => (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{f.name}</td>
                    <td className="py-2.5 px-4 text-center">
                      <input type="checkbox" defaultChecked={f.enabled} className="rounded text-blue-600" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input type="checkbox" defaultChecked={f.required} className="rounded text-blue-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Print Settings Tab ── */}
      {activeSubTab === 'print' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-800">Print & PDF Template Settings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Document Type</th>
                  <th className="py-2.5 px-3 text-center">Item Code</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-center">Brand</th>
                  <th className="py-2.5 px-3 text-center">Seal & Sign</th>
                  <th className="py-2.5 px-3 text-center">Terms Header</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {printMatrix.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{item.label}</td>
                    <td className="py-2.5 px-3 text-center"><input type="checkbox" defaultChecked={item.itemCode} className="rounded text-blue-600" /></td>
                    <td className="py-2.5 px-3 text-center"><input type="checkbox" defaultChecked={item.itemUnit} className="rounded text-blue-600" /></td>
                    <td className="py-2.5 px-3 text-center"><input type="checkbox" defaultChecked={item.itemBrand} className="rounded text-blue-600" /></td>
                    <td className="py-2.5 px-3 text-center"><input type="checkbox" defaultChecked={item.sealSign} className="rounded text-blue-600" /></td>
                    <td className="py-2.5 px-3 text-center"><input type="checkbox" defaultChecked={item.termsHead} className="rounded text-blue-600" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Report Settings Tab ── */}
      {activeSubTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-800">Report Master Catalog</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportsList.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
                <div className="font-bold text-slate-900">{r.name}</div>
                <div className="text-slate-500 text-[11px]">{r.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Country / Region Tab ── */}
      {activeSubTab === 'region' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-800">Country & Tax Region Setup</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Country / Territory</th>
                  <th className="py-2.5 px-4">Currency</th>
                  <th className="py-2.5 px-4">Dial / Country Code</th>
                  <th className="py-2.5 px-4">Standard VAT</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionsList.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{reg.name}</td>
                    <td className="py-2.5 px-4 text-blue-600 font-medium">{reg.currency}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{reg.code}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-600">{reg.taxRate}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">{reg.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Customer Credit Tab ── */}
      {activeSubTab === 'credit' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-800">Customer Credit Limits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Account Name</th>
                  <th className="py-2.5 px-4">Account Owner</th>
                  <th className="py-2.5 px-4">Current Outstanding</th>
                  <th className="py-2.5 px-4">Credit Days</th>
                  <th className="py-2.5 px-4">Credit Limit (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creditList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{c.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.owner}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{c.currentCredit}</td>
                    <td className="py-2.5 px-4 text-slate-500">30 Days</td>
                    <td className="py-2.5 px-4 font-bold text-blue-600">50,000.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Purchase Order Tab ── */}
      {activeSubTab === 'po' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800">Purchase Order Approval Workflow</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Approval Level</th>
                  <th className="py-2.5 px-4">Designated Role</th>
                  <th className="py-2.5 px-4">Primary Approver</th>
                  <th className="py-2.5 px-4">Approval Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CEZCON_PO_APPROVERS_DATA.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{app.level}</td>
                    <td className="py-2.5 px-4 text-slate-700">{app.role}</td>
                    <td className="py-2.5 px-4 font-medium text-blue-600">{app.user}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-600">{app.limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Designation Tab ── */}
      {activeSubTab === 'designation' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-800">Organizational Designations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Designation Title</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 text-center">Active Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designationsList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{d.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{d.department}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-blue-600">{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Defaults Tab ── */}
      {activeSubTab === 'defaults' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-4">
          <h3 className="font-bold text-xs text-slate-800">Company & Global Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Legal Name</label>
              <input type="text" defaultValue="Cool Technologies LLC" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">TRN / Tax Registration Number</label>
              <input type="text" defaultValue="100349284900003" className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Base Currency</label>
              <input type="text" defaultValue="AED (United Arab Emirates Dirham)" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Payment Terms</label>
              <input type="text" defaultValue="30 Days Net from Invoice Date" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
          </div>
        </div>
      )}

      {/* Add Source Modal */}
      {isAddSourceModalOpen && (
        <Modal isOpen={isAddSourceModalOpen} onClose={() => setIsAddSourceModalOpen(false)} title="Add Lead Source">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newSourceName.trim()) {
                setSourcesList([...sourcesList, { id: Date.now(), name: newSourceName.trim() }]);
                setNewSourceName('');
                setIsAddSourceModalOpen(false);
              }
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-medium text-slate-700 mb-1">Source Name *</label>
              <input
                type="text"
                required
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g. LinkedIn Outbound"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddSourceModalOpen(false)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Industry Modal */}
      {isAddIndustryModalOpen && (
        <Modal isOpen={isAddIndustryModalOpen} onClose={() => setIsAddIndustryModalOpen(false)} title="Add Target Industry">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newIndustryName.trim()) {
                setIndustriesList([...industriesList, { id: Date.now(), name: newIndustryName.trim() }]);
                setNewIndustryName('');
                setIsAddIndustryModalOpen(false);
              }
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-medium text-slate-700 mb-1">Industry Name *</label>
              <input
                type="text"
                required
                value={newIndustryName}
                onChange={(e) => setNewIndustryName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g. Pharmaceuticals"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddIndustryModalOpen(false)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
