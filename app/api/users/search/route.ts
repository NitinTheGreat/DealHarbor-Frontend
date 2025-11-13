// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const role = searchParams.get('role');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Forward cookies for authentication
    const cookieHeader = req.headers.get('cookie');

    const url = `${API_BASE}/api/users/search?query=${encodeURIComponent(query)}${role ? `&role=${role}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!response.ok) {
      console.error('Backend error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
