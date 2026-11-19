import { NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can view the audit log' }, { status: 403 });
    }

    const entries = await getAuditLog();
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
