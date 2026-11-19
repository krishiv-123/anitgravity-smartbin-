import { NextResponse } from 'next/server';
import { getSettings, updateSettings, addAuditEntry } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can update settings' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await updateSettings(body);

    await addAuditEntry({
      userId: session.user.id,
      username: session.user.username,
      action: 'SETTINGS_UPDATED',
      target: 'SYSTEM',
      details: `Updated system settings: ${Object.keys(body).join(', ')}`,
    });

    return NextResponse.json({ settings: updated, message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
