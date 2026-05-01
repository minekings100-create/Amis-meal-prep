import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Newsletter signup stub. For now we just log; once Resend audiences are wired
 * up, replace with a call to resend.contacts.create({ email, audienceId }).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = (body.email ?? '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'Invalid email' }, { status: 400 });
    }
    console.log('[newsletter signup]', email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
