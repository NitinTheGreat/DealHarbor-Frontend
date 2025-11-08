// app/api/messages/conversation-with-seller/[sellerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  try {
    const { sellerId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    // Forward cookies for authentication
    const cookieHeader = req.headers.get('cookie');

    const url = `${API_BASE}/api/messages/conversation-with-seller/${sellerId}${productId ? `?productId=${productId}` : ''}`;
    
    console.log('[Get/Create Conversation] Request:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    console.log('[Get/Create Conversation] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Get/Create Conversation] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to get/create conversation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Get/Create Conversation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get/create conversation' },
      { status: 500 }
    );
  }
}
