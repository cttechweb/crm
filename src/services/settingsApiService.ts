/**
 * Settings, Targets, and Pipeline Stages API Service
 * 
 * Manages communication between CRM Frontend and Cloudflare Worker API:
 * - /api/settings/company
 * - /api/settings/system
 * - /api/settings/lead-sources
 * - /api/settings/industries
 * - /api/targets/users
 * - /api/targets/company
 * - /api/opportunity-stages
 * - /api/opportunity-lost-reasons
 * 
 * Includes non-destructive local fallback and non-destructive sync-batch mechanisms.
 */

import { apiClient, ApiError } from '@/lib/apiClient';
import type {
  CezconOpportunityStage,
  CezconLostReason,
  CezconSourceItem,
  CezconIndustryItem,
} from '@/types/settings';

// ============================================================================
// 1. COMPANY & SYSTEM PREFERENCES SERVICE
// ============================================================================
export interface CompanySettingsData {
  companyName: string;
  legalEntity: string;
  trn: string;
  operatingRegion: string;
  primaryEmail: string;
  phone?: string;
  address?: string;
  currency?: string;
  vatRate?: number;
}

export const companySettingsService = {
  async getCompanySettings(): Promise<CompanySettingsData> {
    try {
      const res = await apiClient.get<{ success: boolean; company: any }>('/api/settings/company');
      if (res && res.company) {
        const c = res.company;
        const mapped: CompanySettingsData = {
          companyName: c.company_name || 'Cool Technologies LLC',
          legalEntity: c.legal_entity || 'Cool Technologies LLC',
          trn: c.trn || '100349284900003',
          operatingRegion: c.operating_region || 'United Arab Emirates (AED / +971)',
          primaryEmail: c.primary_email || 'support@cooltechuae.com',
          phone: c.phone || '+971 4 000 0000',
          address: c.address || 'Dubai, United Arab Emirates',
          currency: c.currency || 'AED',
          vatRate: typeof c.vat_rate === 'number' ? c.vat_rate : 5.0,
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_company_settings', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('crm_company_settings');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return {
      companyName: 'Cool Technologies LLC',
      legalEntity: 'Cool Technologies LLC',
      trn: '100349284900003',
      operatingRegion: 'United Arab Emirates (AED / +971)',
      primaryEmail: 'support@cooltechuae.com',
      phone: '+971 4 000 0000',
      address: 'Dubai, United Arab Emirates',
      currency: 'AED',
      vatRate: 5.0,
    };
  },

  async updateCompanySettings(data: Partial<CompanySettingsData>): Promise<CompanySettingsData> {
    if (typeof window !== 'undefined') {
      try {
        const current = localStorage.getItem('crm_company_settings');
        const merged = current ? { ...JSON.parse(current), ...data } : data;
        localStorage.setItem('crm_company_settings', JSON.stringify(merged));
      } catch {}
    }

    try {
      const res = await apiClient.put<{ success: boolean; company: any }>('/api/settings/company', {
        company_name: data.companyName,
        legal_entity: data.legalEntity,
        trn: data.trn,
        operating_region: data.operatingRegion,
        primary_email: data.primaryEmail,
        phone: data.phone,
        address: data.address,
        currency: data.currency,
        vat_rate: data.vatRate,
      });

      if (res && res.company) {
        const c = res.company;
        return {
          companyName: c.company_name,
          legalEntity: c.legal_entity,
          trn: c.trn,
          operatingRegion: c.operating_region,
          primaryEmail: c.primary_email,
          phone: c.phone,
          address: c.address,
          currency: c.currency,
          vatRate: c.vat_rate,
        };
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        throw new Error('Only Administrators can update corporate company settings.');
      }
    }

    return {
      companyName: data.companyName || 'Cool Technologies LLC',
      legalEntity: data.legalEntity || 'Cool Technologies LLC',
      trn: data.trn || '100349284900003',
      operatingRegion: data.operatingRegion || 'United Arab Emirates (AED / +971)',
      primaryEmail: data.primaryEmail || 'support@cooltechuae.com',
      phone: data.phone,
      address: data.address,
      currency: data.currency || 'AED',
      vatRate: data.vatRate ?? 5.0,
    };
  },
};

export const systemSettingsService = {
  async getSystemSettings(category?: string) {
    try {
      const endpoint = category ? `/api/settings/system?category=${encodeURIComponent(category)}` : '/api/settings/system';
      const res = await apiClient.get<{ success: boolean; settings: any[] }>(endpoint);
      return res.settings || [];
    } catch {
      return [];
    }
  },

  async updateSystemSetting(key: string, value: unknown, category?: string) {
    return await apiClient.put<{ success: boolean }>('/api/settings/system', {
      key,
      value,
      category,
    });
  },
};

// ============================================================================
// 2. LEAD SOURCES & TARGET INDUSTRIES
// ============================================================================
export const leadSourceApiService = {
  async getLeadSources(): Promise<CezconSourceItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; sources: any[] }>('/api/settings/lead-sources');
      if (res && Array.isArray(res.sources) && res.sources.length > 0) {
        const mapped = res.sources.map((s) => ({
          id: s.id,
          name: s.name,
          active: Boolean(s.is_active),
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_lead_sources_data', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('crm_lead_sources_data');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return [];
  },

  async createLeadSource(name: string, sortOrder: number = 0): Promise<CezconSourceItem> {
    const res = await apiClient.post<{ success: boolean; source: any }>('/api/settings/lead-sources', {
      name,
      sortOrder,
    });
    return {
      id: res.source.id,
      name: res.source.name,
      active: Boolean(res.source.is_active),
    };
  },

  async deleteLeadSource(id: string | number): Promise<void> {
    await apiClient.delete(`/api/settings/lead-sources/${id}`);
  },

  async syncBatchLeadSources(sources: CezconSourceItem[]): Promise<void> {
    if (!sources || sources.length === 0) return;
    try {
      await apiClient.post('/api/settings/lead-sources/sync-batch', {
        sources: sources.map((s, idx) => ({
          id: String(s.id),
          name: s.name,
          active: s.active ?? true,
          sort_order: idx + 1,
        })),
      });
    } catch {}
  },
};

export const industryApiService = {
  async getIndustries(): Promise<CezconIndustryItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; industries: any[] }>('/api/settings/industries');
      if (res && Array.isArray(res.industries) && res.industries.length > 0) {
        const mapped = res.industries.map((ind) => ({
          id: ind.id,
          name: ind.name,
          active: Boolean(ind.is_active),
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_industries_data', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('crm_industries_data');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return [];
  },

  async createIndustry(name: string, sortOrder: number = 0): Promise<CezconIndustryItem> {
    const res = await apiClient.post<{ success: boolean; industry: any }>('/api/settings/industries', {
      name,
      sortOrder,
    });
    return {
      id: res.industry.id,
      name: res.industry.name,
      active: Boolean(res.industry.is_active),
    };
  },

  async deleteIndustry(id: string | number): Promise<void> {
    await apiClient.delete(`/api/settings/industries/${id}`);
  },

  async syncBatchIndustries(industries: CezconIndustryItem[]): Promise<void> {
    if (!industries || industries.length === 0) return;
    try {
      await apiClient.post('/api/settings/industries/sync-batch', {
        industries: industries.map((ind, idx) => ({
          id: String(ind.id),
          name: ind.name,
          active: ind.active ?? true,
          sort_order: idx + 1,
        })),
      });
    } catch {}
  },
};

// ============================================================================
// 3. USER SALES TARGETS
// ============================================================================
export interface FrontendUserTarget {
  id?: string;
  name: string;
  role: string;
  deals: number;
  targetRev: number;
  closedRev?: number;
  pct?: number;
  period?: string;
  year?: number;
}

export const userTargetApiService = {
  async getUserTargets(year: number = 2026): Promise<FrontendUserTarget[]> {
    try {
      const res = await apiClient.get<{ success: boolean; targets: any[] }>(`/api/targets/users?year=${year}`);
      if (res && Array.isArray(res.targets) && res.targets.length > 0) {
        const mapped: FrontendUserTarget[] = res.targets.map((t) => ({
          id: t.id,
          name: t.user_name,
          role: t.role || 'Sales Representative',
          deals: t.deals || 0,
          targetRev: t.target_rev || 0,
          closedRev: t.closed_rev || 0,
          period: t.period || 'Q1 - 2026',
          year: t.year || 2026,
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_user_targets_data', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('crm_user_targets_data');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return [];
  },

  async saveUserTarget(target: FrontendUserTarget): Promise<FrontendUserTarget> {
    // Preserve local copy
    if (typeof window !== 'undefined') {
      try {
        const current = localStorage.getItem('crm_user_targets_data');
        const list: FrontendUserTarget[] = current ? JSON.parse(current) : [];
        const filtered = list.filter((item) => item.name.toLowerCase() !== target.name.toLowerCase());
        localStorage.setItem('crm_user_targets_data', JSON.stringify([target, ...filtered]));
      } catch {}
    }

    const res = await apiClient.post<{ success: boolean; target: any }>('/api/targets/users', {
      name: target.name,
      role: target.role,
      targetDeals: target.deals,
      targetRev: target.targetRev,
      period: target.period || 'Q1 - 2026',
      year: target.year || 2026,
    });

    return {
      id: res.target.id,
      name: res.target.user_name,
      role: res.target.role,
      deals: res.target.deals,
      targetRev: res.target.target_rev,
      closedRev: res.target.closed_rev,
      period: res.target.period,
      year: res.target.year,
    };
  },

  async deleteUserTarget(id: string): Promise<void> {
    await apiClient.delete(`/api/targets/users/${id}`);
  },

  async syncBatchUserTargets(targets: FrontendUserTarget[]): Promise<void> {
    if (!targets || targets.length === 0) return;
    try {
      await apiClient.post('/api/targets/users/sync-batch', {
        targets: targets.map((t) => ({
          name: t.name,
          role: t.role,
          deals: t.deals,
          targetRev: t.targetRev,
          closedRev: t.closedRev || 0,
          period: t.period || 'Q1 - 2026',
          year: t.year || 2026,
        })),
      });
    } catch {}
  },
};

// ============================================================================
// 4. COMPANY SALES TARGETS
// ============================================================================
export interface FrontendCompanyTarget {
  id: string | number;
  month: string;
  saleTarget: number;
  profitTarget?: number;
  invoiceTarget?: number;
  collectionTarget?: number;
}

export const companyTargetApiService = {
  async getCompanyTargets(): Promise<FrontendCompanyTarget[]> {
    try {
      const res = await apiClient.get<{ success: boolean; targets: any[] }>('/api/targets/company');
      if (res && Array.isArray(res.targets) && res.targets.length > 0) {
        const mapped: FrontendCompanyTarget[] = res.targets.map((t) => ({
          id: t.id,
          month: t.month,
          saleTarget: Number(t.sale_target) || 0,
          profitTarget: t.profit_target !== null ? Number(t.profit_target) : undefined,
          invoiceTarget: t.invoice_target !== null ? Number(t.invoice_target) : undefined,
          collectionTarget: t.collection_target !== null ? Number(t.collection_target) : undefined,
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cezcon_company_targets_v2', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cezcon_company_targets_v2');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return [];
  },

  async createCompanyTarget(target: Omit<FrontendCompanyTarget, 'id'> & { id?: string | number }): Promise<FrontendCompanyTarget> {
    const res = await apiClient.post<{ success: boolean; target: any }>('/api/targets/company', {
      month: target.month,
      saleTarget: target.saleTarget,
      profitTarget: target.profitTarget,
      invoiceTarget: target.invoiceTarget,
      collectionTarget: target.collectionTarget,
    });

    return {
      id: res.target.id,
      month: res.target.month,
      saleTarget: Number(res.target.sale_target) || 0,
      profitTarget: res.target.profit_target !== null ? Number(res.target.profit_target) : undefined,
      invoiceTarget: res.target.invoice_target !== null ? Number(res.target.invoice_target) : undefined,
      collectionTarget: res.target.collection_target !== null ? Number(res.target.collection_target) : undefined,
    };
  },

  async updateCompanyTarget(id: string | number, target: Partial<FrontendCompanyTarget>): Promise<FrontendCompanyTarget> {
    const res = await apiClient.put<{ success: boolean; target: any }>(`/api/targets/company/${id}`, {
      month: target.month,
      saleTarget: target.saleTarget,
      profitTarget: target.profitTarget,
      invoiceTarget: target.invoiceTarget,
      collectionTarget: target.collectionTarget,
    });

    return {
      id: res.target.id,
      month: res.target.month,
      saleTarget: Number(res.target.sale_target) || 0,
      profitTarget: res.target.profit_target !== null ? Number(res.target.profit_target) : undefined,
      invoiceTarget: res.target.invoice_target !== null ? Number(res.target.invoice_target) : undefined,
      collectionTarget: res.target.collection_target !== null ? Number(res.target.collection_target) : undefined,
    };
  },

  async deleteCompanyTarget(id: string | number): Promise<void> {
    await apiClient.delete(`/api/targets/company/${id}`);
  },

  async syncBatchCompanyTargets(targets: FrontendCompanyTarget[]): Promise<void> {
    if (!targets || targets.length === 0) return;
    try {
      await apiClient.post('/api/targets/company/sync-batch', {
        targets: targets.map((t) => ({
          id: String(t.id),
          month: t.month,
          saleTarget: t.saleTarget,
          profitTarget: t.profitTarget,
          invoiceTarget: t.invoiceTarget,
          collectionTarget: t.collectionTarget,
        })),
      });
    } catch {}
  },
};

// ============================================================================
// 5. OPPORTUNITY PIPELINE STAGES
// ============================================================================
export const opportunityStageApiService = {
  async getOpportunityStages(): Promise<CezconOpportunityStage[]> {
    try {
      const res = await apiClient.get<{ success: boolean; stages: any[] }>('/api/opportunity-stages');
      if (res && Array.isArray(res.stages) && res.stages.length > 0) {
        const mapped: CezconOpportunityStage[] = res.stages.map((s) => ({
          id: s.id,
          name: s.name,
          abbreviation: s.abbreviation,
          color: s.color,
          textColor: s.text_color || s.color,
          probability: s.probability,
          order: s.stage_order,
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cezcon_opportunity_stages', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cezcon_opportunity_stages');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return [];
  },

  async createOpportunityStage(stage: Omit<CezconOpportunityStage, 'id'>): Promise<CezconOpportunityStage> {
    const res = await apiClient.post<{ success: boolean; stage: any }>('/api/opportunity-stages', {
      name: stage.name,
      abbreviation: stage.abbreviation,
      color: stage.color,
      textColor: stage.textColor || stage.color,
      probability: stage.probability,
      order: stage.order,
    });

    return {
      id: res.stage.id,
      name: res.stage.name,
      abbreviation: res.stage.abbreviation,
      color: res.stage.color,
      textColor: res.stage.text_color || res.stage.color,
      probability: res.stage.probability,
      order: res.stage.stage_order,
    };
  },

  async updateOpportunityStage(id: string | number, stage: Partial<CezconOpportunityStage>): Promise<void> {
    await apiClient.put(`/api/opportunity-stages/${id}`, {
      name: stage.name,
      abbreviation: stage.abbreviation,
      color: stage.color,
      textColor: stage.textColor,
      probability: stage.probability,
      stageOrder: stage.order,
    });
  },

  async deleteOpportunityStage(id: string | number): Promise<void> {
    await apiClient.delete(`/api/opportunity-stages/${id}`);
  },

  async syncBatchOpportunityStages(stages: CezconOpportunityStage[]): Promise<void> {
    if (!stages || stages.length === 0) return;
    try {
      await apiClient.post('/api/opportunity-stages/sync-batch', {
        stages: stages.map((s) => ({
          id: String(s.id),
          name: s.name,
          abbreviation: s.abbreviation,
          color: s.color,
          textColor: s.textColor,
          probability: s.probability,
          order: s.order,
        })),
      });
    } catch {}
  },
};

// ============================================================================
// 6. OPPORTUNITY LOST REASONS
// ============================================================================
export const opportunityLostReasonApiService = {
  async getOpportunityLostReasons(): Promise<CezconLostReason[]> {
    try {
      const res = await apiClient.get<{ success: boolean; reasons: any[] }>('/api/opportunity-lost-reasons');
      if (res && Array.isArray(res.reasons) && res.reasons.length > 0) {
        const mapped: CezconLostReason[] = res.reasons.map((r) => ({
          id: r.id,
          reason: r.reason,
          description: r.description || undefined,
          active: Boolean(r.is_active),
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cezcon_lost_reasons', JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch {
      // Local fallback
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cezcon_lost_reasons');
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    return [];
  },

  async createOpportunityLostReason(reason: string, description?: string): Promise<CezconLostReason> {
    const res = await apiClient.post<{ success: boolean; lostReason: any }>('/api/opportunity-lost-reasons', {
      reason,
      description,
    });

    return {
      id: res.lostReason.id,
      reason: res.lostReason.reason,
      description: res.lostReason.description || undefined,
      active: Boolean(res.lostReason.is_active),
    };
  },

  async updateOpportunityLostReason(id: string | number, data: Partial<CezconLostReason>): Promise<void> {
    await apiClient.put(`/api/opportunity-lost-reasons/${id}`, {
      reason: data.reason,
      description: data.description,
      active: data.active,
    });
  },

  async deleteOpportunityLostReason(id: string | number): Promise<void> {
    await apiClient.delete(`/api/opportunity-lost-reasons/${id}`);
  },

  async syncBatchOpportunityLostReasons(reasons: CezconLostReason[]): Promise<void> {
    if (!reasons || reasons.length === 0) return;
    try {
      await apiClient.post('/api/opportunity-lost-reasons/sync-batch', {
        reasons: reasons.map((r) => ({
          id: String(r.id),
          reason: r.reason,
          description: r.description,
          active: r.active ?? true,
        })),
      });
    } catch {}
  },
};
