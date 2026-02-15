import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleUploadPhotoRequest } from '../../../../lib/api/uploadPhotoProxy';

export async function POST(req: Request) {
  const resp = await handleUploadPhotoRequest(req);
  // Convert Response to NextResponse by streaming body and headers
  const body = await resp.text();
  const headers: Record<string, string> = {};
  resp.headers.forEach((v, k) => (headers[k] = v));
  return new NextResponse(body, { status: resp.status, headers });
}
