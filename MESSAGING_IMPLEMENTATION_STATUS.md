# MESSAGING SYSTEM - IMPLEMENTATION STATUS & NEXT STEPS

## ✅ COMPLETED

### API Routes Created:
1. `/api/messages/sellers/search/route.ts` - Seller search with debouncing
2. `/api/messages/conversation-with-seller/[sellerId]/route.ts` - Get/create conversation
3. `/api/messages/conversations/[id]/route.ts` - Get conversation details
4. `/api/messages/route.ts` - Updated to use `/conversations` endpoint

### Still TODO - Update existing files to match new backend API:

## 🔧 FILES THAT NEED UPDATING

### 1. `app/api/messages/conversations/[id]/messages/route.ts`
- Add POST method for sending messages
- Add pagination support (page, size query params)
- Update logging format

### 2. `app/messages/page.tsx`
COMPLETE REWRITE NEEDED based on guide:
- Use `/api/messages/conversation-with-seller/{sellerId}` for direct chats
- Implement seller search UI with debouncing (lodash)
- Update to use paginated API responses
- Remove placeholder conversation logic
- Use real conversation data from backend

### 3. `app/messages/components/ConversationList.tsx`
- Update to use `/api/messages?page=0&size=20` (already correct)
- Handle paginated response format
- Add auto-refresh every 30 seconds
- Show product context if available
- Display unread badges

### 4. `app/messages/components/ChatArea.tsx`
RENAME TO: `app/messages/components/ChatWindow.tsx` and update:
- Load conversation details via `/api/messages/conversations/{id}`
- Load messages via `/api/messages/conversations/{id}/messages?page=0&size=50`
- Send messages via POST to `/api/messages/conversations/{id}/messages`
- Remove template message logic (handled by backend)
- Add typing indicators
- Add mark as read functionality

### 5. `lib/websocket.ts`
UPDATE to match guide:
- Subscribe to `/user/{userId}/queue/messages`
- Subscribe to `/user/{userId}/queue/typing`
- Subscribe to `/user/{userId}/queue/presence`
- Send to `/app/chat.send`
- Send to `/app/chat.typing/{conversationId}`
- Send to `/app/chat.read`
- Send to `/app/user.presence`

### 6. Remove old files:
- `app/api/users/search/route.ts` (replaced by sellers/search)

## 📦 INSTALL DEPENDENCIES

```bash
npm install lodash @types/lodash date-fns
```

## 🎯 KEY CHANGES FROM CURRENT IMPLEMENTATION:

1. **No more placeholder conversations** - Backend creates them via `/conversation-with-seller`
2. **Paginated responses** - All list endpoints return `{ content: [], totalElements, totalPages }`
3. **Seller search** - Dedicated endpoint with debouncing
4. **Product context** - Automatically included in conversation responses
5. **WebSocket protocol** - Updated destinations to match backend guide

## 🚀 IMPLEMENTATION ORDER:

1. Install dependencies
2. Update API routes (messages endpoint)
3. Update WebSocket client
4. Rewrite messages/page.tsx
5. Update ChatWindow (formerly ChatArea)
6. Update ConversationList
7. Test seller search
8. Test direct chat via ?sellerId
9. Test real-time messaging
10. Test typing indicators

## 📝 BACKEND API ENDPOINTS (from guide):

- GET `/api/messages/sellers/search?query={name}&page=0&size=10`
- GET `/api/messages/conversation-with-seller/{sellerId}?productId={id}`
- GET `/api/messages/conversations?page=0&size=20`
- GET `/api/messages/conversations/{id}`
- GET `/api/messages/conversations/{id}/messages?page=0&size=50`
- POST `/api/messages/conversations/{id}/messages` - Body: `{ content, messageType: "TEXT" }`
- PUT `/api/messages/conversations/{id}/read`
- GET `/api/messages/unread-count`
- DELETE `/api/messages/conversations/{id}`

All endpoints forward authentication cookies automatically.
