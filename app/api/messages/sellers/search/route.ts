// app/api/messages/sellers/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ content: [], totalElements: 0, totalPages: 0 });
    }

    // Forward cookies for authentication
    const cookieHeader = req.headers.get('cookie');

    const url = `${API_BASE}/api/messages/sellers/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    
    console.log('[Seller Search] Request:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    console.log('[Seller Search] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Seller Search] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to search sellers', content: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Seller Search] Results:', data.content?.length || 0, 'sellers found');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Seller Search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search sellers', content: [] },
      { status: 500 }
    );
  }
}
