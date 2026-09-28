'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Search,
  DollarSign,
  Clock,
  Briefcase,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { COST_JOB_TYPES } from '@/data/settingsMockData';
import { CostJobTypeItem } from '@/types/settings';

export function CostJobTab() {
  const [jobList, setJobList] = useState<CostJobTypeItem[]>(COST_JOB_TYPES);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CostJobTypeItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    costPerHour: 150,
    estimatedHours: 4,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crm_cost_jobs_data');
      if (saved) {
        setJobList(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newJob: CostJobTypeItem = {
      id: Date.now(),
      name: formData.name.trim(),
      costPerHour: Number(formData.costPerHour) || 100,
      estimatedHours: Number(formData.estimatedHours) || 1,
    };

    const updated = [newJob, ...jobList];
    setJobList(updated);
    try {
      localStorage.setItem('crm_cost_jobs_data', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setFormData({ name: '', costPerHour: 150, estimatedHours: 4 });
    setIsAddModalOpen(false);
    showToast(`Job profile "${newJob.name}" created successfully!`);
  };

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const updated = jobList.map((j) => (j.id === editingJob.id ? editingJob : j));
    setJobList(updated);
    try {
      localStorage.setItem('crm_cost_jobs_data', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setEditingJob(null);
    showToast('Job profile updated successfully!');
  };

  const handleDeleteJob = (id: number | string) => {
    const updated = jobList.filter((j) => j.id !== id);
    setJobList(updated);
    try {
      localStorage.setItem('crm_cost_jobs_data', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast('Job profile deleted');
  };

  const filteredJobs = useMemo(() => {
    return jobList.filter((j) => j.name.toLowerCase().includes(search.toLowerCase()));
  }, [jobList, search]);

  const avgRate = jobList.length > 0 ? Math.round(jobList.reduce((acc, j) => acc + j.costPerHour, 0) / jobList.length) : 0;
  const totalStandardHours = jobList.reduce((acc, j) => acc + j.estimatedHours, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Active Job Profiles</span>
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{jobList.length}</div>
          <span className="text-[11px] font-medium text-slate-500">Service categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Avg Billable Rate</span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">AED {avgRate}.00 <span className="text-xs font-semibold text-slate-500">/hr</span></div>
          <span className="text-[11px] font-medium text-slate-500">Standard labor benchmark</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-violet-50/50 border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">Standard Job Hours</span>
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalStandardHours} <span className="text-xs font-semibold text-slate-500">Hours</span></div>
          <span className="text-[11px] font-medium text-slate-500">Total catalogue duration</span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 bg-white p-5 space-y-4 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Job Costing & Billable Hourly Rates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure standard hourly labor charges, estimated durations, and base cost calculations for quotation generation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search job profile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-56"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Job Profile
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Job / Service Description</th>
                <th className="py-3 px-4">Standard Hourly Rate</th>
                <th className="py-3 px-4">Estimated Standard Duration</th>
                <th className="py-3 px-4">Computed Standard Job Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No job cost profiles found. Click &quot;Add Job Profile&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const totalJobCost = job.costPerHour * job.estimatedHours;
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{job.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600">
                        AED {job.costPerHour.toLocaleString()}.00 <span className="text-[11px] font-normal text-slate-400">/hr</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {job.estimatedHours} Hours
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-600">
                        AED {totalJobCost.toLocaleString()}.00
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingJob(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Job"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── MODAL: Add Job Cost Profile ── */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Job Cost Profile"
          description="Define standard billable hourly rate and estimated duration for job costing."
          icon={<Briefcase className="w-5 h-5 text-blue-600" />}
          maxWidth="md"
        >
          <form onSubmit={handleAddJob} className="space-y-4 text-xs">
            <Input
              label="Job / Service Title *"
              required
              placeholder="e.g. On-Site Chiller Overhaul & Commissioning"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Billable Rate (AED/hour) *"
                type="number"
                required
                min={1}
                value={formData.costPerHour}
                onChange={(e) => setFormData({ ...formData, costPerHour: Number(e.target.value) })}
              />
              <Input
                label="Estimated Duration (Hours) *"
                type="number"
                required
                min={0.5}
                step={0.5}
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Calculated Standard Job Cost:</span>
              <span className="text-sm font-black text-blue-700">
                AED {((Number(formData.costPerHour) || 0) * (Number(formData.estimatedHours) || 0)).toLocaleString()}.00
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Check className="w-4 h-4" />}>
                Save Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Edit Job Cost Profile ── */}
      {editingJob && (
        <Modal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          title="Edit Job Cost Profile"
          description={`Update parameters for ${editingJob.name}`}
          icon={<Edit2 className="w-5 h-5 text-blue-600" />}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateJob} className="space-y-4 text-xs">
            <Input
              label="Job / Service Title *"
              required
              value={editingJob.name}
              onChange={(e) => setEditingJob({ ...editingJob, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Billable Rate (AED/hour) *"
                type="number"
                required
                value={editingJob.costPerHour}
                onChange={(e) => setEditingJob({ ...editingJob, costPerHour: Number(e.target.value) })}
              />
              <Input
                label="Estimated Duration (Hours) *"
                type="number"
                required
                value={editingJob.estimatedHours}
                onChange={(e) => setEditingJob({ ...editingJob, estimatedHours: Number(e.target.value) })}
              />
            </div>

            <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Updated Job Cost:</span>
              <span className="text-sm font-black text-blue-700">
                AED {(editingJob.costPerHour * editingJob.estimatedHours).toLocaleString()}.00
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingJob(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Check className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
