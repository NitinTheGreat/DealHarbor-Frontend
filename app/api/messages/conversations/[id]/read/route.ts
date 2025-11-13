// app/api/messages/conversations/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// PUT /api/messages/conversations/{id}/read - Mark all messages as read
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = req.headers.get('cookie');

    console.log(`[Mark as Read] Conversation: ${id}`);

    const response = await fetch(`${API_BASE}/api/messages/conversations/${id}/read`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    console.log('[Mark as Read] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Mark as Read] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to mark as read' },
        { status: response.status }
      );
    }

    // Backend returns plain text, not JSON
    const text = await response.text();
    console.log('[Mark as Read] Backend response:', text);
    return NextResponse.json({ success: true, message: text });
  } catch (error) {
    console.error('[Mark as Read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}
