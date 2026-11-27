import { NextRequest, NextResponse } from 'next/server';
import {
  getAllOrdersWithApprovals,
  upsertOrderInStore,
  deleteOrderFromStore,
  purgeDemoProcurementData,
  resetDemoProcurementData,
  getProcurementStore,
} from '@/lib/serverProcurementStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orders = getAllOrdersWithApprovals();
    const store = getProcurementStore();
    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
      deletedIds: store.deletedIds || [],
      lastUpdated: store.lastUpdated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'purge_demo') {
      purgeDemoProcurementData();
      return NextResponse.json({ success: true, message: 'All demo procurement data purged.' });
    }

    if (action === 'reset_demo') {
      resetDemoProcurementData();
      return NextResponse.json({ success: true, message: 'Demo procurement data reset to initial baseline.' });
    }

    const body = await req.json();
    if (!body || !body.supplier) {
      return NextResponse.json({ success: false, message: 'Invalid purchase order payload' }, { status: 400 });
    }

    upsertOrderInStore(body);
    return NextResponse.json({ success: true, order: body });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process purchase order' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('id') || searchParams.get('poNumber');
    const action = searchParams.get('action');

    if (targetId) {
      const removed = deleteOrderFromStore(targetId);
      return NextResponse.json({
        success: true,
        removed,
        id: targetId,
        message: `Purchase Order ${targetId} permanently deleted from central store.`,
      });
    }

    if (action === 'purge_demo' || !targetId) {
      purgeDemoProcurementData();
      return NextResponse.json({ success: true, message: 'Procurement database cleaned successfully.' });
    }

    return NextResponse.json({ success: false, message: 'Missing target id' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}
