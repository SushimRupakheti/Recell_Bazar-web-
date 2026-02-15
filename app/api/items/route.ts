import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { proxyCreateItem } from '../../../lib/api/items';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieHeader = req.headers.get('cookie') || undefined;
    const result = await proxyCreateItem(body, cookieHeader);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Create proxy failed' }, { status: 500 });
  }
}
