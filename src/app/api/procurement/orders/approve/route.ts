import { NextRequest, NextResponse } from 'next/server';
import { recordOrderApproval, getAllOrdersWithApprovals } from '@/lib/serverProcurementStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const poNumber = body.poNumber || body.purchaseOrder?.poNumber;
    const poId = body.id || body.purchaseOrder?.id;
    const decision = body.decision || 'Approved';
    const approverName = body.approverName || body.approver_name || 'Hamdan';
    const approverDesignation =
      body.approverDesignation || body.approver_designation || 'Finance Controller';
    const remarks = body.remarks;
    const updatedOrder = body.updatedOrder || body.purchaseOrder;

    const approvalRecord = recordOrderApproval({
      id: poId,
      poNumber,
      decision,
      approverName,
      approverDesignation,
      remarks,
      updatedOrder,
    });

    const allOrders = getAllOrdersWithApprovals();
    const matchedOrder = allOrders.find(
      (o) => (poNumber && o.poNumber === poNumber) || (poId && o.id === poId)
    );

    return NextResponse.json({
      success: true,
      approval: approvalRecord,
      order: matchedOrder || updatedOrder,
      message: `Purchase Order ${poNumber || poId} marked as ${decision}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to record approval' },
      { status: 500 }
    );
  }
}
