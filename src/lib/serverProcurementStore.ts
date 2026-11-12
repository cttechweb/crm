import fs from 'fs';
import path from 'path';
import { baselinePurchaseOrders } from '@/data/mockEnterpriseData';

export interface ProcurementApprovalRecord {
  approval: 'Approved' | 'Rejected' | 'Waiting for Final Approval';
  approvedByName?: string;
  approvedByDesignation?: string;
  approvedAt?: string;
  remarks?: string;
}

export interface ProcurementStoreState {
  orders: any[];
  approvals: Record<string, ProcurementApprovalRecord>;
  deletedIds: string[];
  lastUpdated: string;
}

const STORE_FILE = path.join(
  process.platform === 'win32' ? (process.env.TEMP || 'C:\\Windows\\Temp') : '/tmp',
  'crm_procurement_store.json'
);

function loadProcurementStoreFromFile(): ProcurementStoreState | null {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.orders)) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

function saveProcurementStoreToFile(store: ProcurementStoreState): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store), 'utf-8');
  } catch {}
}

const g = globalThis as unknown as { __CRM_PROCUREMENT_STORE__?: ProcurementStoreState };

export function getProcurementStore(): ProcurementStoreState {
  if (!g.__CRM_PROCUREMENT_STORE__) {
    const fromDisk = loadProcurementStoreFromFile();
    if (fromDisk) {
      g.__CRM_PROCUREMENT_STORE__ = fromDisk;
    } else {
      // Clone baseline purchase orders as initial seed
      const initialOrders = baselinePurchaseOrders.map((o) => ({ ...o }));
      g.__CRM_PROCUREMENT_STORE__ = {
        orders: initialOrders,
        approvals: {},
        deletedIds: [],
        lastUpdated: new Date().toISOString(),
      };
      saveProcurementStoreToFile(g.__CRM_PROCUREMENT_STORE__);
    }
  }
  if (!Array.isArray(g.__CRM_PROCUREMENT_STORE__.deletedIds)) {
    g.__CRM_PROCUREMENT_STORE__.deletedIds = [];
  }
  return g.__CRM_PROCUREMENT_STORE__;
}

export function getAllOrdersWithApprovals(): any[] {
  const store = getProcurementStore();
  const deletedSet = new Set((store.deletedIds || []).map((d) => String(d).trim().toLowerCase()));

  return store.orders
    .filter((po) => {
      const k1 = String(po.poNumber || '').trim().toLowerCase();
      const k2 = String(po.id || '').trim().toLowerCase();
      if (k1 && deletedSet.has(k1)) return false;
      if (k2 && deletedSet.has(k2)) return false;
      return true;
    })
    .map((po) => {
      const key1 = po.poNumber;
      const key2 = po.id;
      // If the PO itself explicitly has approval: 'Waiting for Final Approval', do not override with old approval
      if (po.approval === 'Waiting for Final Approval') {
        return po;
      }
      const app = (key1 && store.approvals[key1]) || (key2 && store.approvals[key2]);
      if (app) {
        return {
          ...po,
          approval: app.approval,
          approvedByName: app.approvedByName || po.approvedByName,
          approvedByDesignation: app.approvedByDesignation || po.approvedByDesignation,
          approvedAt: app.approvedAt || po.approvedAt,
        };
      }
      return po;
    });
}

export function recordOrderApproval(payload: {
  id?: string;
  poNumber?: string;
  decision: 'Approved' | 'Rejected' | 'Waiting for Final Approval';
  approverName?: string;
  approverDesignation?: string;
  remarks?: string;
  updatedOrder?: any;
}) {
  const store = getProcurementStore();
  const poNum = payload.poNumber || payload.updatedOrder?.poNumber;
  const poId = payload.id || payload.updatedOrder?.id;

  const approvalRecord: ProcurementApprovalRecord = {
    approval: payload.decision,
    approvedByName: payload.approverName || 'Hamdan',
    approvedByDesignation: payload.approverDesignation || 'Finance Controller',
    approvedAt: new Date().toISOString(),
    remarks: payload.remarks,
  };

  if (poNum) store.approvals[poNum] = approvalRecord;
  if (poId) store.approvals[poId] = approvalRecord;

  // Update in the live orders array as well
  let matched = false;
  store.orders = store.orders.map((po) => {
    if ((poNum && po.poNumber === poNum) || (poId && po.id === poId)) {
      matched = true;
      return {
        ...po,
        ...(payload.updatedOrder || {}),
        approval: approvalRecord.approval,
        approvedByName: approvalRecord.approvedByName,
        approvedByDesignation: approvalRecord.approvedByDesignation,
        approvedAt: approvalRecord.approvedAt,
      };
    }
    return po;
  });

  // If new order passed that wasn't in store, prepend it
  if (!matched && payload.updatedOrder) {
    store.orders.unshift({
      ...payload.updatedOrder,
      approval: approvalRecord.approval,
      approvedByName: approvalRecord.approvedByName,
      approvedByDesignation: approvalRecord.approvedByDesignation,
      approvedAt: approvalRecord.approvedAt,
    });
  }

  store.lastUpdated = new Date().toISOString();
  saveProcurementStoreToFile(store);
  return approvalRecord;
}

export function upsertOrderInStore(order: any) {
  const store = getProcurementStore();
  const poNum = order.poNumber;
  const poId = order.id;

  // If order is in 'Waiting for Final Approval' state, purge any stale approval registry entry
  if (order.approval === 'Waiting for Final Approval') {
    if (poNum) delete store.approvals[poNum];
    if (poId) delete store.approvals[poId];
  }

  let existingIndex = store.orders.findIndex(
    (o) => (poNum && o.poNumber === poNum) || (poId && o.id === poId)
  );

  if (existingIndex >= 0) {
    store.orders[existingIndex] = { ...store.orders[existingIndex], ...order };
  } else {
    store.orders.unshift(order);
  }
  store.lastUpdated = new Date().toISOString();
  saveProcurementStoreToFile(store);
}

export function deleteOrderFromStore(idOrPoNumber: string): boolean {
  const store = getProcurementStore();
  if (!idOrPoNumber) return false;
  const target = String(idOrPoNumber).trim();
  const lowerTarget = target.toLowerCase();

  const matched = store.orders.find(
    (o) =>
      String(o.id || '').trim().toLowerCase() === lowerTarget ||
      String(o.poNumber || '').trim().toLowerCase() === lowerTarget
  );

  const idsToBlacklist = new Set<string>(store.deletedIds || []);
  idsToBlacklist.add(target);
  if (matched) {
    if (matched.id) idsToBlacklist.add(String(matched.id));
    if (matched.poNumber) idsToBlacklist.add(String(matched.poNumber));
  }
  store.deletedIds = Array.from(idsToBlacklist);

  const beforeCount = store.orders.length;
  store.orders = store.orders.filter(
    (o) =>
      String(o.id || '').trim().toLowerCase() !== lowerTarget &&
      String(o.poNumber || '').trim().toLowerCase() !== lowerTarget
  );

  if (matched?.id) delete store.approvals[matched.id];
  if (matched?.poNumber) delete store.approvals[matched.poNumber];
  delete store.approvals[target];

  store.lastUpdated = new Date().toISOString();
  saveProcurementStoreToFile(store);
  return store.orders.length < beforeCount;
}

export function purgeDemoProcurementData() {
  const store = getProcurementStore();
  store.orders = [];
  store.approvals = {};
  store.deletedIds = [];
  store.lastUpdated = new Date().toISOString();
  saveProcurementStoreToFile(store);
}

export function resetDemoProcurementData() {
  const store = getProcurementStore();
  store.orders = baselinePurchaseOrders.map((o) => ({ ...o }));
  store.approvals = {};
  store.deletedIds = [];
  store.lastUpdated = new Date().toISOString();
  saveProcurementStoreToFile(store);
}
