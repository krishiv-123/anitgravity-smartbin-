import { NextResponse } from 'next/server';
import { getBinById, updateBin, deleteBin, addBinHistory, addAuditEntry } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const bin = await getBinById(id);
    if (!bin) return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
    return NextResponse.json({ bin, demoMode: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bin' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, note } = body;

    const bin = await getBinById(id);
    if (!bin) return NextResponse.json({ error: 'Bin not found' }, { status: 404 });

    if (action === 'collect') {
      // Only admin and collector can collect
      if (!['admin', 'collector'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Reset fill level (demo value since no real sensor)
      const demoResetLevel = Math.floor(Math.random() * 8) + 2; // 2-10%
      await updateBin(id, {
        fillLevel: demoResetLevel,
        lastCollection: new Date().toISOString(),
        status: bin.status === 'damaged' ? 'damaged' : 'operational',
      });

      await addBinHistory(id, {
        action: 'COLLECTED',
        performedBy: session.user.username,
        notes: `Bin collected. Fill level reset to ${demoResetLevel}% (demo value — no live sensor). ${note || ''}`.trim(),
      });

      await addAuditEntry({
        userId: session.user.id,
        username: session.user.username,
        action: 'BIN_COLLECTED',
        target: id,
        details: `Collected bin ${bin.name}. Fill reset to ${demoResetLevel}% (demo). ${note || ''}`.trim(),
      });

      const updated = await getBinById(id);
      return NextResponse.json({ bin: updated, message: 'Bin marked as collected' });
    }

    // Admin-only: update bin properties
    if (session.user.role === 'admin') {
      const allowedFields = ['name', 'status', 'binType', 'capacity', 'fillLevel', 'sensorBattery', 'location'];
      const updateData = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) updateData[field] = body[field];
      }

      if (Object.keys(updateData).length > 0) {
        await updateBin(id, updateData);
        await addAuditEntry({
          userId: session.user.id,
          username: session.user.username,
          action: 'BIN_UPDATED',
          target: id,
          details: `Updated bin ${bin.name} (${id}) properties: ${Object.keys(updateData).join(', ')}`,
        });
        const updated = await getBinById(id);
        return NextResponse.json({ bin: updated, message: 'Bin updated successfully' });
      }
    }

    return NextResponse.json({ error: 'Invalid action or insufficient permissions' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bin' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can delete bins' }, { status: 403 });
    }

    const { id } = await params;
    const bin = await getBinById(id);
    if (!bin) return NextResponse.json({ error: 'Bin not found' }, { status: 404 });

    const deleted = await deleteBin(id);
    if (!deleted) return NextResponse.json({ error: 'Failed to delete bin' }, { status: 500 });

    await addAuditEntry({
      userId: session.user.id,
      username: session.user.username,
      action: 'BIN_DELETED',
      target: id,
      details: `Deleted bin ${bin.name} (${id})`,
    });

    return NextResponse.json({ message: 'Bin deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bin' }, { status: 500 });
  }
}
