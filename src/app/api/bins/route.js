import { NextResponse } from 'next/server';
import { getBins, createBin, addAuditEntry } from '@/lib/store';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const bins = await getBins();
    return NextResponse.json({ bins, demoMode: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bins' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can add new bins' }, { status: 403 });
    }

    const body = await request.json();
    const { name, binType, capacity, location } = body;

    if (!name || !binType || !location?.address || !location?.neighborhood) {
      return NextResponse.json({ error: 'Name, bin type, address, and neighborhood are required' }, { status: 400 });
    }

    // Default lat/lng near downtown if not provided
    const lat = location.lat ? parseFloat(location.lat) : 30.2672 + (Math.random() - 0.5) * 0.02;
    const lng = location.lng ? parseFloat(location.lng) : -97.7431 + (Math.random() - 0.5) * 0.02;

    const newBin = await createBin({
      name,
      binType,
      capacity: capacity || '240L',
      status: 'operational',
      fillLevel: 0,
      sensorBattery: 100,
      location: {
        address: location.address,
        neighborhood: location.neighborhood,
        lat,
        lng,
      },
      createdBy: session.user.username,
    });

    await addAuditEntry({
      userId: session.user.id,
      username: session.user.username,
      action: 'BIN_CREATED',
      target: newBin.id,
      details: `Added new bin ${newBin.name} (${newBin.id}) at ${location.address}`,
    });

    return NextResponse.json({ bin: newBin, message: 'Bin added successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bin' }, { status: 500 });
  }
}
