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
  lastUpdated: string;
}

const g = globalThis as unknown as { __CRM_PROCUREMENT_STORE__?: ProcurementStoreState };

export function getProcurementStore(): ProcurementStoreState {
  if (!g.__CRM_PROCUREMENT_STORE__) {
    // Clone baseline purchase orders as initial seed
    const initialOrders = baselinePurchaseOrders.map((o) => ({ ...o }));
    g.__CRM_PROCUREMENT_STORE__ = {
      orders: initialOrders,
      approvals: {},
      lastUpdated: new Date().toISOString(),
    };
  }
  return g.__CRM_PROCUREMENT_STORE__;
}

export function getAllOrdersWithApprovals(): any[] {
  const store = getProcurementStore();
  return store.orders.map((po) => {
    const key1 = po.poNumber;
    const key2 = po.id;
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
  return approvalRecord;
}

export function upsertOrderInStore(order: any) {
  const store = getProcurementStore();
  const poNum = order.poNumber;
  const poId = order.id;

  let existingIndex = store.orders.findIndex(
    (o) => (poNum && o.poNumber === poNum) || (poId && o.id === poId)
  );

  if (existingIndex >= 0) {
    store.orders[existingIndex] = { ...store.orders[existingIndex], ...order };
  } else {
    store.orders.unshift(order);
  }
  store.lastUpdated = new Date().toISOString();
}

export function purgeDemoProcurementData() {
  const store = getProcurementStore();
  store.orders = [];
  store.approvals = {};
  store.lastUpdated = new Date().toISOString();
}

export function resetDemoProcurementData() {
  const store = getProcurementStore();
  store.orders = baselinePurchaseOrders.map((o) => ({ ...o }));
  store.approvals = {};
  store.lastUpdated = new Date().toISOString();
}
