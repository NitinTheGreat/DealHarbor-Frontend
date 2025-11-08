// app/api/messages/unread-count/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// GET /api/messages/unread-count - Get total unread message count
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');

    const response = await fetch(`${API_BASE}/api/messages/unread-count`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    console.log('[Unread Count] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unread Count] Backend error:', errorText);
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const count = await response.json();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('[Unread Count] Error:', error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
