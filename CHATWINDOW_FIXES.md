# ChatWindow Real-Time Updates - Fixes Applied

## Issues Fixed

### 1. ✅ Messages Not Auto-Updating in ChatWindow
**Problem**: Messages appeared instantly in the sidebar (conversation list) but didn't show in the main chat window until page refresh.

**Root Cause**: 
- Potential type mismatch between conversationId (string vs number)
- Race condition with `loadConversationDetails()` call
- Missing detailed logging to debug the issue

**Solution Applied**:
```typescript
// Added explicit type coercion for conversationId comparison
const messageConvId = String(message.conversationId);
const currentConvId = String(conversationId);

if (messageConvId === currentConvId) {
  // Message processing...
}
```

**Changes Made**:
- Added type coercion to ensure string comparison works correctly
- Removed `loadConversationDetails()` call that caused race conditions
- Added detailed console logging with emojis for easier debugging
- Optimized scroll timing (50ms instead of 100ms)
- Added logging to show when messages are skipped (already exist)

### 2. ✅ Online Status Not Updating Reliably
**Problem**: Online status in ChatWindow header showed "Offline" even when sidebar showed green dot (user was online).

**Root Cause**: 
- Presence updates were being received but not fully processed
- Multiple state locations needed updating (otherParticipant, conversation)
- Insufficient logging made debugging difficult

**Solution Applied**:
```typescript
// Enhanced presence handler with detailed logging
const handlePresence = (data) => {
  console.log('[ChatWindow] Checking presence:', {
    'data.userId': data.userId,
    'otherParticipant?.userId': otherParticipant?.userId,
    'conversation?.otherUserId': conversation?.otherUserId,
    'isOtherUser': isOtherUser
  });
  
  // Update both otherParticipant AND conversation state
  setOtherParticipant((prev) => ({
    ...prev,
    onlineStatus: data.status,
    lastSeen: data.lastSeen || prev.lastSeen,
  }));
  
  setConversation((prev) => ({
    ...prev,
    isOnline: data.status === 'ONLINE',
  }));
}
```

**Changes Made**:
- Added comprehensive presence update logging
- Ensured both `otherParticipant` and `conversation` states update
- Added fallback for lastSeen to prevent overwriting with undefined
- Added status emoji logging (🔄, 👤, 💬) for easier debugging

### 3. ✅ Enhanced WebSocket Logging
**Problem**: Difficult to debug why messages/presence weren't working.

**Solution Applied**:
- Added detailed message logging in WebSocket service
- Shows message ID, conversationId, senderId, and content preview
- Logs number of callbacks being notified
- Added emoji prefixes for easy log filtering:
  - 📨 = Messages
  - 👤 = Personal presence
  - 🌍 = Global presence
  - ✅ = Success
  - ❌ = Error

## Testing Instructions

### Test 1: Message Real-Time Updates
1. Open two browser windows/tabs
2. Login as different users in each
3. Start a conversation
4. Send messages from User A
5. **Expected**: Messages appear instantly in User B's ChatWindow (no refresh needed)
6. **Check Console**: Look for:
   ```
   📨 [WebSocket] New message received via /user/queue/messages
   [ChatWindow] ✅ Message belongs to this conversation, adding to messages
   [ChatWindow] 🆕 Adding new message to state
   ```

### Test 2: Online Status Updates
1. Open two browser windows/tabs
2. Login as different users
3. User A opens chat with User B
4. User B goes online (login/refresh)
5. **Expected**: User A's ChatWindow header shows "● Online" (green) immediately
6. User B goes offline (close tab)
7. **Expected**: User A's ChatWindow header updates to "Offline" or shows last seen
8. **Check Console**: Look for:
   ```
   🌍 [WebSocket] Global presence update: {userId: "...", status: "ONLINE"}
   [ChatWindow] ✅ Presence update is for the other user in this conversation
   [ChatWindow] 🔄 Updating status to: ONLINE
   [ChatWindow] 👤 Updated otherParticipant: {...}
   [ChatWindow] 💬 Updated conversation: {...}
   ```

### Test 3: Conversation ID Matching
1. Open ChatWindow
2. Send/receive a message
3. **Check Console**: Look for:
   ```
   [ChatWindow] Current conversation ID: "123" Type: string
   [ChatWindow] Message conversation ID: "123" Type: string
   [ChatWindow] ✅ Message belongs to this conversation
   ```
4. **If you see**:
   ```
   [ChatWindow] ❌ Message does NOT belong to this conversation
   Expected: "123", Got: "456"
   ```
   This means the message is for a different conversation (correct behavior)

## Console Logging Guide

### Normal Message Flow:
```
📨 [WebSocket] New message received via /user/queue/messages
📨 [WebSocket] Notifying 1 message callbacks
[ChatWindow] New message received
[ChatWindow] Current conversation ID: "123" Type: string
[ChatWindow] Message conversation ID: "123" Type: string
[ChatWindow] ✅ Message belongs to this conversation, adding to messages
[ChatWindow] 🆕 Adding new message to state
```

### Normal Presence Flow:
```
🌍 [WebSocket] Global presence update: {userId: "user-456", status: "ONLINE"}
🌍 [WebSocket] Notifying 2 presence callbacks
[ChatWindow] Presence update received: {userId: "user-456", status: "ONLINE"}
[ChatWindow] Checking presence: {data.userId: "user-456", otherParticipant?.userId: "user-456", ...}
[ChatWindow] ✅ Presence update is for the other user in this conversation
[ChatWindow] 🔄 Updating status to: ONLINE
[ChatWindow] 👤 Updated otherParticipant: {userId: "user-456", onlineStatus: "ONLINE", ...}
[ChatWindow] 💬 Updated conversation: {isOnline: true, ...}
```

### Message Belongs to Different Conversation (Normal):
```
[ChatWindow] ❌ Message does NOT belong to this conversation, ignoring
Expected: "123", Got: "456"
```

### Message Already Exists (Normal - Prevents Duplicates):
```
[ChatWindow] ⚠️ Message already exists, skipping
```

## What to Look For

### ✅ Good Signs:
- Messages appear instantly without refresh
- Online status updates in header match sidebar
- Console shows "✅" and "🆕" emojis
- No error messages in console

### ❌ Problem Indicators:
- Messages only appear after refresh
- Online status stuck on "Offline"
- Console shows "❌ Message does NOT belong" for messages that should belong
- Type mismatch in conversationId logs (string vs number)
- WebSocket shows "Notifying 0 callbacks" (no listeners registered)

## Remaining Issues to Watch For

1. **If messages still don't update**:
   - Check if WebSocket is connected: Look for "✅ WebSocket connected" in console
   - Verify backend is sending conversationId in message payload
   - Check if conversationId type matches (string vs number)

2. **If online status still buggy**:
   - Verify backend is broadcasting to `/topic/presence`
   - Check if userId in presence update matches conversation participant
   - Ensure WebSocket connection is maintained

3. **Performance issues**:
   - If too many console logs, can be disabled in production
   - Scroll behavior might need adjustment if messages are very long

## Files Modified

1. **app/messages/components/ChatWindow.tsx**:
   - Enhanced `handleNewMessage` with type coercion and better logging
   - Enhanced `handlePresence` with comprehensive state updates
   - Removed race condition causing conversation refresh issues

2. **lib/websocket.ts**:
   - Added detailed message logging with emoji prefixes
   - Added callback count logging
   - Enhanced presence update logging

## Next Steps

1. Test with real users in production-like environment
2. Monitor console logs for any unexpected patterns
3. If issues persist, check backend message/presence payload formats
4. Consider adding reconnection indicators in UI
5. Add toast notifications for connection status changes
