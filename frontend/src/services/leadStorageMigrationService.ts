/**
 * Safe, Non-Destructive Lead Storage Migration Service
 * 
 * Migrates existing browser localStorage leads to Cloudflare D1 via authenticated Worker API:
 * - Reads from primary key `cooltech_crm_leads` (and fallback `crm_leads_data`)
 * - NEVER clears or deletes localStorage data
 * - Identifies records by stable existing IDs (preserves IDs and timestamps)
 * - Checks remote existence before upload to prevent duplicate inserts and duplicate activity logs
 * - Validates required fields locally before upload (never uploads invalid records silently)
 * - Verifies remote persistence with a secondary GET before marking a record as `synced`
 * - Handles partial failures, network drops, and auth errors without corrupting local data
 * - Maintains sync metadata in companion key `cooltech_crm_leads_sync_meta`
 */

import { leadApiService } from '@/services/leadApiService';
import { ApiError } from '@/lib/apiClient';
import type { CrmLead } from '@/types/enterprise-crm';

export const PRIMARY_STORAGE_KEY = 'cooltech_crm_leads';
export const FALLBACK_STORAGE_KEY = 'crm_leads_data';
export const SYNC_METADATA_KEY = 'cooltech_crm_leads_sync_meta';

export type LeadSyncStatus = 'synced' | 'pending' | 'failed' | 'invalid' | 'skipped_existing';

export interface LeadSyncItemResult {
  id: string;
  contactName: string;
  companyName: string;
  status: LeadSyncStatus;
  errorMessage?: string;
  verifiedAt?: string;
  sourceKey: string;
}

export interface LeadMigrationSummary {
  totalFound: number;
  synced: number;
  skippedExisting: number;
  failed: number;
  invalid: number;
  results: LeadSyncItemResult[];
}

export interface LeadSyncMetaRecord {
  status: LeadSyncStatus;
  lastAttemptAt: string;
  verifiedAt?: string;
  errorMessage?: string;
}

export type LeadSyncMetaMap = Record<string, LeadSyncMetaRecord>;

/**
 * Validates whether a lead has all mandatory fields required by the database and API.
 */
export function validateLeadRecord(lead: unknown): { valid: boolean; error?: string } {
  if (!lead || typeof lead !== 'object') {
    return { valid: false, error: 'Record is empty or not an object.' };
  }

  const l = lead as Record<string, unknown>;

  if (!l.id || typeof l.id !== 'string' || !l.id.trim()) {
    return { valid: false, error: 'Lead is missing a valid identifier (id).' };
  }

  const contactDetails = l.contactDetails as Record<string, unknown> | undefined;
  if (!contactDetails || typeof contactDetails !== 'object') {
    return { valid: false, error: 'Missing contactDetails object.' };
  }

  const name = typeof contactDetails.name === 'string' ? contactDetails.name.trim() : '';
  const phone = typeof contactDetails.phone === 'string' ? contactDetails.phone.trim() : '';
  const company = typeof contactDetails.company === 'string' ? contactDetails.company.trim() : '';

  if (!name) {
    return { valid: false, error: 'Contact Name (contactDetails.name) is required.' };
  }
  if (!phone) {
    return { valid: false, error: 'Contact Phone (contactDetails.phone) is required.' };
  }
  if (!company) {
    return { valid: false, error: 'Company Name (contactDetails.company) is required.' };
  }

  const spec = typeof l.leadSpecification === 'string' && l.leadSpecification.trim()
    ? l.leadSpecification.trim()
    : typeof l.comments === 'string' && l.comments.trim()
      ? l.comments.trim()
      : typeof l.businessOpportunity === 'string' && l.businessOpportunity.trim()
        ? l.businessOpportunity.trim()
        : '';

  if (!spec) {
    return { valid: false, error: 'Lead Specification or Comments is required.' };
  }

  return { valid: true };
}

/**
 * Safely reads all lead records from localStorage without modifying them.
 */
export function getLocalStorageLeads(): { leads: CrmLead[]; sourceMap: Record<string, string> } {
  if (typeof window === 'undefined') {
    return { leads: [], sourceMap: {} };
  }

  const leadsMap = new Map<string, CrmLead>();
  const sourceMap: Record<string, string> = {};

  const readFromKey = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: unknown) => {
          if (item && typeof item === 'object' && 'id' in item) {
            const lead = item as CrmLead;
            const strId = String(lead.id).trim();
            if (strId && !leadsMap.has(strId)) {
              leadsMap.set(strId, lead);
              sourceMap[strId] = key;
            }
          }
        });
      }
    } catch (e) {
      console.warn(`[leadStorageMigrationService] Error parsing localStorage key "${key}":`, e);
    }
  };

  // Read primary key first, then fallback key
  readFromKey(PRIMARY_STORAGE_KEY);
  readFromKey(FALLBACK_STORAGE_KEY);

  return {
    leads: Array.from(leadsMap.values()),
    sourceMap,
  };
}

/**
 * Retrieves persisted sync metadata from the companion key.
 */
export function getSyncMetadata(): LeadSyncMetaMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SYNC_METADATA_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Persists sync metadata to the companion key (leaving lead data untouched).
 */
export function saveSyncMetadata(meta: LeadSyncMetaMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error('[leadStorageMigrationService] Failed to save sync metadata:', e);
  }
}

export interface MigrationApiInterface {
  getLead: typeof leadApiService.getLead;
  createLead: typeof leadApiService.createLead;
}

export interface MigrateLeadsOptions {
  api?: MigrationApiInterface;
  onProgress?: (progress: { current: number; total: number; currentItem?: LeadSyncItemResult }) => void;
  forceRetryFailed?: boolean;
}

/**
 * Executes safe, deduplicated migration of existing browser leads to Cloudflare D1.
 */
export async function migrateLeadsToRemote(
  options: MigrateLeadsOptions = {}
): Promise<LeadMigrationSummary> {
  const api = options.api || leadApiService;
  const { leads, sourceMap } = getLocalStorageLeads();
  const currentMeta = getSyncMetadata();
  const updatedMeta: LeadSyncMetaMap = { ...currentMeta };

  const results: LeadSyncItemResult[] = [];
  let syncedCount = 0;
  let skippedExistingCount = 0;
  let failedCount = 0;
  let invalidCount = 0;

  const total = leads.length;

  for (let i = 0; i < total; i++) {
    const lead = leads[i];
    const leadId = String(lead.id).trim();
    const contactName = lead.contactDetails?.name || 'Unknown Contact';
    const companyName = lead.contactDetails?.company || 'Unknown Company';
    const sourceKey = sourceMap[leadId] || PRIMARY_STORAGE_KEY;

    // Check if already synced according to verified metadata
    const existingMeta = updatedMeta[leadId];
    if (existingMeta && existingMeta.status === 'synced' && existingMeta.verifiedAt) {
      const itemResult: LeadSyncItemResult = {
        id: leadId,
        contactName,
        companyName,
        status: 'synced',
        verifiedAt: existingMeta.verifiedAt,
        sourceKey,
      };
      results.push(itemResult);
      syncedCount++;
      options.onProgress?.({ current: i + 1, total, currentItem: itemResult });
      continue;
    }

    // 1. Validate fields locally (never upload invalid records silently)
    const validation = validateLeadRecord(lead);
    if (!validation.valid) {
      const itemResult: LeadSyncItemResult = {
        id: leadId,
        contactName,
        companyName,
        status: 'invalid',
        errorMessage: validation.error,
        sourceKey,
      };
      results.push(itemResult);
      invalidCount++;
      updatedMeta[leadId] = {
        status: 'invalid',
        lastAttemptAt: new Date().toISOString(),
        errorMessage: validation.error,
      };
      options.onProgress?.({ current: i + 1, total, currentItem: itemResult });
      continue;
    }

    try {
      // 2. Check if the lead already exists remotely in Cloudflare D1
      let alreadyExistsRemotely = false;
      try {
        const checkRes = await api.getLead(leadId);
        if (checkRes && checkRes.lead && checkRes.lead.id === leadId) {
          alreadyExistsRemotely = true;
        }
      } catch (checkErr: unknown) {
        if (checkErr instanceof ApiError && checkErr.status === 404) {
          // Confirmed NOT present remotely, safe to upload
          alreadyExistsRemotely = false;
        } else if (checkErr instanceof ApiError && checkErr.status === 401) {
          throw new ApiError('Authentication required to access CRM database.', 401);
        } else {
          // If check failed due to network, fail early to prevent duplicate attempts
          const errMsg = checkErr instanceof Error ? checkErr.message : 'Remote existence check failed';
          throw new Error(`Pre-check failed: ${errMsg}`);
        }
      }

      if (alreadyExistsRemotely) {
        const verifiedTime = new Date().toISOString();
        const itemResult: LeadSyncItemResult = {
          id: leadId,
          contactName,
          companyName,
          status: 'skipped_existing',
          verifiedAt: verifiedTime,
          sourceKey,
        };
        results.push(itemResult);
        skippedExistingCount++;
        updatedMeta[leadId] = {
          status: 'synced',
          lastAttemptAt: verifiedTime,
          verifiedAt: verifiedTime,
        };
        options.onProgress?.({ current: i + 1, total, currentItem: itemResult });
        continue;
      }

      // 3. Prepare payload preserving existing ID and timestamps
      const spec = lead.leadSpecification || lead.comments || lead.businessOpportunity || 'Commercial client HVAC inquiry';
      const cleanLeadData: Partial<CrmLead> = {
        ...lead,
        id: leadId,
        leadSpecification: spec,
      };

      // 4. Upload missing record to remote D1
      await api.createLead(cleanLeadData);

      // 5. Verification step: double-check remote persistence before claiming success
      let verifyRes;
      try {
        verifyRes = await api.getLead(leadId);
      } catch (verifyErr: unknown) {
        const vMsg = verifyErr instanceof Error ? verifyErr.message : 'Record not found after creation';
        throw new Error(`Remote verification check failed: ${vMsg}`);
      }
      if (!verifyRes || !verifyRes.lead || verifyRes.lead.id !== leadId) {
        throw new Error('Remote verification check failed: Record was not found after creation.');
      }

      const verifiedAt = new Date().toISOString();
      const itemResult: LeadSyncItemResult = {
        id: leadId,
        contactName,
        companyName,
        status: 'synced',
        verifiedAt,
        sourceKey,
      };
      results.push(itemResult);
      syncedCount++;
      updatedMeta[leadId] = {
        status: 'synced',
        lastAttemptAt: verifiedAt,
        verifiedAt,
      };
      options.onProgress?.({ current: i + 1, total, currentItem: itemResult });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown synchronization error';
      const itemResult: LeadSyncItemResult = {
        id: leadId,
        contactName,
        companyName,
        status: 'failed',
        errorMessage: errorMsg,
        sourceKey,
      };
      results.push(itemResult);
      failedCount++;
      updatedMeta[leadId] = {
        status: 'failed',
        lastAttemptAt: new Date().toISOString(),
        errorMessage: errorMsg,
      };
      options.onProgress?.({ current: i + 1, total, currentItem: itemResult });
    }
  }

  // Persist updated metadata without touching lead records
  saveSyncMetadata(updatedMeta);

  return {
    totalFound: total,
    synced: syncedCount,
    skippedExisting: skippedExistingCount,
    failed: failedCount,
    invalid: invalidCount,
    results,
  };
}

export default {
  validateLeadRecord,
  getLocalStorageLeads,
  getSyncMetadata,
  saveSyncMetadata,
  migrateLeadsToRemote,
};
