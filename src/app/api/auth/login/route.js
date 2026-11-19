import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { addAuditEntry } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await verifyUser(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Set session
    const session = await getSession();
    session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
    };
    await session.save();

    await addAuditEntry({
      userId: user.id,
      username: user.username,
      action: 'LOGIN',
      target: user.id,
      details: `User ${user.username} signed in`,
    });

    return NextResponse.json({ user: session.user, message: 'Signed in successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
