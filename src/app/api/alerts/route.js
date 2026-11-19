import { NextResponse } from 'next/server';
import { getAlerts, createAlert, addAuditEntry, getBinById } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json({ alerts, demoMode: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'repair', 'collector'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { binId, type, severity, message } = body;

    if (!binId || !type || !severity || !message) {
      return NextResponse.json({ error: 'binId, type, severity, and message are required' }, { status: 400 });
    }

    const bin = await getBinById(binId);
    if (!bin) {
      return NextResponse.json({ error: 'Target bin not found' }, { status: 404 });
    }

    const newAlert = await createAlert({
      binId,
      type,
      severity,
      message,
    });

    await addAuditEntry({
      userId: session.user.id,
      username: session.user.username,
      action: 'ALERT_CREATED',
      target: newAlert.id,
      details: `Created alert for ${binId}: ${type} (${severity}) - ${message}`,
    });

    return NextResponse.json({ alert: newAlert, message: 'Alert created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
