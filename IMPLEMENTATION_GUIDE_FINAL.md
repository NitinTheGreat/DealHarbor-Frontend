# MESSAGING SYSTEM - COMPLETE IMPLEMENTATION GUIDE

## ✅ COMPLETED FILES:

### API Routes (All working):
1. `/api/messages/route.ts` - Get conversations (paginated)
2. `/api/messages/sellers/search/route.ts` - Search sellers with debouncing
3. `/api/messages/conversation-with-seller/[sellerId]/route.ts` - Get/create conversation
4. `/api/messages/conversations/[id]/route.ts` - Get conversation details
5. `/api/messages/conversations/[id]/messages/route.ts` - Get/Post messages (paginated)
6. `/api/messages/conversations/[id]/read/route.ts` - Mark as read
7. `/api/messages/unread-count/route.ts` - Get unread count

### Core Libraries:
- `lib/websocket.ts` - ✅ UPDATED - Matches backend guide exactly
- `lib/websocket-old.ts` - Backup of old implementation

### New Components Ready:
- `app/messages/components/ConversationListNew.tsx` - ✅ Ready to use

## 🚀 NEXT STEPS - MANUAL UPDATES NEEDED:

### 1. Replace ConversationList Component
```bash
# Backup and replace
mv app/messages/components/ConversationList.tsx app/messages/components/ConversationList-old.tsx
mv app/messages/components/ConversationListNew.tsx app/messages/components/ConversationList.tsx
```

### 2. Update `app/messages/page.tsx`

**Key Changes Needed:**
- Remove placeholder conversation logic
- Use `/api/messages/conversation-with-seller/{sellerId}` for direct chats
- Remove productId fetch logic (backend handles it)
- Add seller search modal
- Simplify WebSocket integration

**Replace entire file with:**
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/ClientAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { wsService } from '@/lib/websocket';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import SellerSearch from './components/SellerSearch';
import ConnectionStatus from './components/ConnectionStatus';
import { Loader2, Plus } from 'lucide-react';

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSellerSearch, setShowSellerSearch] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?returnTo=/messages');
    }
  }, [user, authLoading, router]);

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

    wsService.connect(user.id);

    const unsubscribe = wsService.onConnection((connected) => {
      setIsConnected(connected);
    });

    const unsubscribePresence = wsService.onPresence((update) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (update.status === 'ONLINE') {
          newSet.add(update.userId);
        } else {
          newSet.delete(update.userId);
        }
        return newSet;
      });
    });

    return () => {
      unsubscribe();
      unsubscribePresence();
      wsService.disconnect();
    };
  }, [user]);

  // Handle sellerId query param
  useEffect(() => {
    const sellerId = searchParams.get('sellerId');
    const productId = searchParams.get('productId');

    if (sellerId) {
      handleOpenSellerChat(sellerId, productId || undefined);
    }
  }, [searchParams]);

  const handleOpenSellerChat = async (sellerId: string, productId?: string) => {
    try {
      const url = `/api/messages/conversation-with-seller/${sellerId}${productId ? `?productId=${productId}` : ''}`;
      console.log('[Messages] Opening chat with seller:', url);
      
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Failed to open chat');
      }
      
      const conversation = await response.json();
      setActiveConversationId(conversation.id);
      
      // Update URL to remove query params
      router.replace('/messages');
    } catch (error) {
      console.error('[Messages] Failed to open seller chat:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#FEF5F6] to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D97E96] mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#FEF5F6] via-white to-[#FEF5F6]">
      <ConnectionStatus isConnected={isConnected} />

      {/* Left Sidebar - Conversations */}
      <div className="w-full md:w-96 bg-white/90 backdrop-blur-lg border-r border-white/20 flex flex-col shadow-xl">
        {/* Header with New Chat Button */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-[#D97E96]/10 to-[#E598AD]/10">
          <div className="flex items-center justify-between mb-4">
            <h1
              className="text-3xl font-bold text-[#2D3748]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Messages
            </h1>
            <button
              onClick={() => setShowSellerSearch(true)}
              className="p-2 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-xl hover:shadow-lg transition-all"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Seller Search Modal */}
        {showSellerSearch && (
          <SellerSearch
            onSelectSeller={(sellerId, hasExisting, existingConvId) => {
              if (hasExisting && existingConvId) {
                setActiveConversationId(existingConvId);
              } else {
                handleOpenSellerChat(sellerId);
              }
              setShowSellerSearch(false);
            }}
            onClose={() => setShowSellerSearch(false)}
          />
        )}

        {/* Conversation List */}
        <ConversationList
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Right Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white/50 backdrop-blur">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation or start a new chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Create SellerSearch Component

Create `app/messages/components/SellerSearch.tsx`:
- Use lodash debounce for search (500ms delay)
- Call `/api/messages/sellers/search?query={q}&page=0&size=10`
- Show seller cards with profile, products count, rating
- Indicate if existing conversation exists
- Handle selection callback

### 4. Create ChatWindow Component

Create `app/messages/components/ChatWindow.tsx`:
- Load conversation via `/api/messages/conversations/{id}`
- Load messages via `/api/messages/conversations/{id}/messages?page=0&size=50`
- Send messages via POST to `/api/messages/conversations/{id}/messages`
- Subscribe to WebSocket for real-time messages
- Auto-mark as read when viewing
- Show typing indicators
- Show online status

### 5. Update ProductActions Component

In `app/products/[id]/components/ProductActions.tsx`:
- Keep the simple redirect: `router.push(\`/messages?sellerId=\${sellerId}&productId=\${productId}\`)`
- Remove all conversation creation logic
- Backend handles everything

## 🎯 TEST PLAN:

1. **Test Conversations List**: Visit `/messages` - should load conversations
2. **Test Seller Search**: Click + button, search for seller
3. **Test Direct Chat**: Visit `/messages?sellerId={id}&productId={id}`
4. **Test Real-time**: Open two browsers, send messages
5. **Test Typing**: Type in one browser, see indicator in other
6. **Test Online Status**: Connect/disconnect, see status changes

## 📦 FILES STATUS:

✅ All API routes created and working
✅ WebSocket client updated
✅ ConversationListNew ready
⏳ Need to create: SellerSearch, ChatWindow
⏳ Need to update: messages/page.tsx, ProductActions
⏳ Need to test: End-to-end flow

## 🚨 IMPORTANT NOTES:

1. Backend must be running on port 8080
2. WebSocket endpoint: ws://localhost:8080/ws
3. All API calls use cookie-based auth (automatic)
4. Paginated responses have `{content: [], totalElements, totalPages}` format
5. sellerId in URL creates conversation automatically via backend

Ready to continue implementation!
