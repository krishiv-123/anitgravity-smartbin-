import { NextResponse } from 'next/server';
import { getComplaints, createComplaint, updateComplaint, addAuditEntry } from '@/lib/store';
import { generateRefNumber } from '@/lib/utils';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const complaints = await getComplaints();
    return NextResponse.json({ complaints, demoMode: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { issueType, binId, location, description, contactName, contactEmail, contactPhone } = body;

    // Validate required fields
    if (!issueType) return NextResponse.json({ error: 'Issue type is required' }, { status: 400 });
    if (!location && !binId) return NextResponse.json({ error: 'Location or bin ID is required' }, { status: 400 });
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
    }

    // Validate email format if provided
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Sanitize input
    const sanitize = (s) => (typeof s === 'string' ? s.trim().slice(0, 1000) : '');

    const complaint = await createComplaint({
      refNumber: generateRefNumber(),
      issueType: sanitize(issueType),
      binId: sanitize(binId) || null,
      location: sanitize(location),
      description: sanitize(description),
      photoUrl: null,
      contactName: sanitize(contactName) || null,
      contactEmail: sanitize(contactEmail) || null,
      contactPhone: sanitize(contactPhone) || null,
    });

    return NextResponse.json({ complaint, message: 'Report submitted successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, resolutionNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const updated = await updateComplaint(id, {
      status,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : null,
      resolutionNote: resolutionNote || null,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    await addAuditEntry({
      userId: session.user.id,
      username: session.user.username,
      action: 'COMPLAINT_UPDATED',
      target: id,
      details: `Status updated to ${status} for complaint ${updated.refNumber}`,
    });

    return NextResponse.json({ complaint: updated, message: 'Complaint updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
