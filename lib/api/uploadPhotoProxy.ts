import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

// Existing Next.js API (NextApiRequest/Response) handler
export async function handleUploadPhoto(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const target = `${BACKEND}/api/items/upload-photo`;

    const headers: Record<string, string> = {};
    if (req.headers['content-type']) headers['content-type'] = String(req.headers['content-type']);
    if (req.headers.cookie) {
      const cookieStr = String(req.headers.cookie);
      headers['cookie'] = cookieStr;
      try {
        const parts = cookieStr.split(';').map((c) => c.trim());
        const tok = parts.find((p) => p.startsWith('auth_token='));
        if (tok) {
          const val = decodeURIComponent(tok.split('=')[1] || '');
          if (val) headers['authorization'] = `Bearer ${val}`;
        }
      } catch (e) {
        // ignore
      }
    }

    const backendRes = await fetch(target, {
      method: 'POST',
      headers,
      body: req as any,
      // @ts-ignore - Node/undici specific option
      duplex: 'half',
    } as any);

    const status = backendRes.status;
    const contentType = backendRes.headers.get('content-type') || '';
    const text = await backendRes.text();

    res.status(status);
    if (contentType.includes('application/json')) {
      try {
        return res.json(JSON.parse(text));
      } catch (e) {
        return res.send(text);
      }
    }

    res.setHeader('content-type', contentType);
    return res.send(text);
  } catch (err: any) {
    console.error('Upload-photo proxy error', err);
    return res.status(500).json({ success: false, message: err.message || 'Proxy upload failed' });
  }
}

// New: Request/Response (App Router) friendly handler
export async function handleUploadPhotoRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  }

  try {
    const target = `${BACKEND}/api/items/upload-photo`;

    const headers: Record<string, string> = {};
    const contentType = req.headers.get('content-type');
    const cookieHeader = req.headers.get('cookie');
    if (contentType) headers['content-type'] = contentType;
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
      try {
        const parts = cookieHeader.split(';').map((c) => c.trim());
        const tok = parts.find((p) => p.startsWith('auth_token='));
        if (tok) {
          const val = decodeURIComponent(tok.split('=')[1] || '');
          if (val) headers['authorization'] = `Bearer ${val}`;
        }
      } catch (e) {}
    }

    const backendRes = await fetch(target, {
      method: 'POST',
      headers,
      // forward the request body (stream)
      body: req.body as any,
      // @ts-ignore
      duplex: 'half',
    } as any);

    const respText = await backendRes.text();
    const respContentType = backendRes.headers.get('content-type') || '';

    const responseInit: ResponseInit = { status: backendRes.status, headers: {} } as any;
    if (respContentType) (responseInit.headers as any)['content-type'] = respContentType;

    return new Response(respText, responseInit);
  } catch (err: any) {
    console.error('Upload-photo proxy error (Request)', err);
    return new Response(JSON.stringify({ success: false, message: err.message || 'Proxy upload failed' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
