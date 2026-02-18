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

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const search = urlObj.search || '';
    const target = `${BASE}/api/items${search}`;

    const cookie = req.headers.get('cookie') || '';
    const auth = req.headers.get('authorization') || '';

    const getCookieValue = (cookieHeader: string, name: string) => {
      if (!cookieHeader) return null;
      const parts = cookieHeader.split('; ');
      const match = parts.find((p) => p.startsWith(name + '='));
      if (!match) return null;
      return decodeURIComponent(match.split('=').slice(1).join('='));
    };

    const tokenFromCookie = getCookieValue(cookie, 'auth_token') || getCookieValue(cookie, 'token');
    const authorizationHeader = auth || (tokenFromCookie ? `Bearer ${tokenFromCookie}` : '');

    const res = await fetch(target, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
        ...(authorizationHeader ? { authorization: authorizationHeader } : {}),
      },
    });

    const body = await res.text();
    const ct = res.headers.get('content-type') || 'application/json';

    return new NextResponse(body, { status: res.status, headers: { 'content-type': ct } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Items GET proxy failed' }, { status: 500 });
  }
}
