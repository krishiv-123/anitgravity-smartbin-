import { NextResponse } from 'next/server';
import { getAlertById, updateAlert, getBinById, updateBin, addBinHistory, addAuditEntry } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, note } = body;

    const alert = await getAlertById(id);
    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

    if (action === 'resolve') {
      // Only admin and repair can resolve damage/maintenance alerts
      if (!['admin', 'repair'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      await updateAlert(id, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: session.user.username,
        resolutionNote: note || 'Issue resolved.',
      });

      // If it's a damage alert, update the bin status
      if (alert.type === 'damage') {
        const bin = await getBinById(alert.binId);
        if (bin && bin.status === 'damaged') {
          await updateBin(alert.binId, { status: 'operational' });
          await addBinHistory(alert.binId, {
            action: 'REPAIRED',
            performedBy: session.user.username,
            notes: `Damage issue resolved. ${note || ''}`.trim(),
          });
        }
      }

      await addAuditEntry({
        userId: session.user.id,
        username: session.user.username,
        action: 'ALERT_RESOLVED',
        target: id,
        details: `Resolved alert for ${alert.binId}. ${note || ''}`.trim(),
      });

      const updated = await getAlertById(id);
      return NextResponse.json({ alert: updated, message: 'Alert resolved' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
