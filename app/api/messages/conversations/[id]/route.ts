// app/api/messages/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// GET /api/messages/conversations/{id} - Get specific conversation details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = req.headers.get('cookie');

    console.log(`[Conversation Details] Fetching conversation: ${id}`);

    const response = await fetch(`${API_BASE}/api/messages/conversations/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    console.log('[Conversation Details] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Conversation Details] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Conversation Details] Backend response data:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Conversation Details] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
