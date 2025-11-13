# 💬 DealHarbor Real-Time Messaging System

A production-grade, WhatsApp-like messaging system built with **Next.js 15**, **STOMP WebSocket**, and **Spring Boot**.

## ✨ Features

- ✅ **Real-time messaging** - Instant delivery with sub-100ms latency
- ✅ **Typing indicators** - See when someone is typing
- ✅ **Read receipts** - Know when messages are read (✓✓)
- ✅ **Online presence** - Real-time user status (online/offline)
- ✅ **Message status tracking** - Sending → Sent → Delivered → Read
- ✅ **Auto-reconnection** - Graceful handling of connection drops
- ✅ **Optimistic updates** - Instant UI feedback
- ✅ **Glassmorphic UI** - Modern, smooth design
- ✅ **Mobile responsive** - Works on all screen sizes
- ✅ **Product context** - Messages linked to products
- ✅ **Direct chat from product page** - One-click seller contact

---

## 🏗️ Architecture

```
┌─────────────────┐         WebSocket/STOMP          ┌──────────────────┐
│   Next.js UI    │◄──────────────────────────────►  │   Spring Boot    │
│   (Frontend)    │    ws://localhost:8080/ws        │   WebSocket      │
│                 │                                   │   Server         │
└─────────────────┘                                   └──────────────────┘
         │                                                      │
         │                                                      │
         ▼                                                      ▼
┌─────────────────┐                                   ┌──────────────────┐
│  WebSocket      │                                   │   PostgreSQL     │
│  Service        │                                   │   Database       │
│  (lib/          │                                   │                  │
│   websocket.ts) │                                   │  - Conversations │
└─────────────────┘                                   │  - Messages      │
                                                      │  - Users         │
                                                      └──────────────────┘
```

---

## 📁 Project Structure

```
app/
├── messages/
│   ├── page.tsx                      # Main messages page
│   └── components/
│       ├── ConversationList.tsx      # Left sidebar - conversations
│       ├── ConversationItem.tsx      # Individual conversation card
│       └── ChatArea.tsx              # Right side - chat interface
├── products/[id]/
│   └── components/
│       └── ProductActions.tsx        # "Chat with Seller" button
└── api/
    └── messages/
        ├── route.ts                  # GET conversations, POST message
        └── conversations/
            └── [id]/
                └── messages/
                    └── route.ts      # GET messages for conversation

lib/
├── websocket.ts                      # WebSocket service (singleton)
└── types/
    └── conversation.ts               # TypeScript interfaces

hooks/
└── useAuth.tsx                       # Authentication hook
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install sockjs-client @stomp/stompjs
npm install --save-dev @types/sockjs-client
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Start Backend Server

Ensure your Spring Boot server is running on `http://localhost:8080` with WebSocket endpoint `/ws`.

### 4. Start Frontend

```bash
npm run dev
```

Visit `http://localhost:3000/messages`

---

## 💻 Usage

### Accessing Messages Page

1. **Direct Access**: Navigate to `/messages`
2. **From Product Page**: Click "Chat with Seller" button
3. **With URL Parameters**:
   - `/messages?conversationId=123` - Open specific conversation
   - `/messages?sellerId=456` - Open chat with specific seller

### Sending Messages

1. Type your message in the input box
2. Press **Enter** to send (or click send button)
3. Use **Shift + Enter** for new line
4. Messages show status indicators:
   - 🔄 **Sending** - Spinning loader
   - ✓ **Sent** - Single check
   - ✓✓ **Delivered** - Double check (gray)
   - ✓✓ **Read** - Double check (blue)

### Typing Indicators

When you type, the other user sees "typing..." animation in real-time.

### Online Presence

Green dot shows when user is online, "Last seen" shows when offline.

---

## 🎨 Design Features

### Glassmorphism

The UI uses glassmorphic design with:
- Frosted glass background (`backdrop-blur`)
- Semi-transparent panels
- Smooth shadows and borders

### Color Scheme

Follows `globals.css` variables:
- **Primary**: `#D97E96` (pink)
- **Primary Hover**: `#E598AD`
- **Background**: `#FEF5F6`
- **Text**: `#333333`
- **Heading**: `#2D3748`
- **Subheading**: `#718096`

### Fonts

- **Headings**: College (custom font)
- **Subheadings**: Rabelo (custom font)
- **Body**: Inter (Google Font)
- **Buttons**: Barlow Semi Condensed

### Animations

- **fadeIn**: Messages fade in smoothly
- **slideIn**: Conversations slide in
- **pulse**: Typing indicator animation
- **bounce**: Animated dots

---

## 🔧 WebSocket Service API

### Connect to WebSocket

```typescript
import { wsService } from '@/lib/websocket';

// Connect (usually in useEffect)
wsService.connect(userId);

// Disconnect (cleanup)
wsService.disconnect();
```

### Send Message

```typescript
const tempId = wsService.sendMessage(
  conversationId,
  recipientId,
  messageContent
);
```

### Listen for Messages

```typescript
const unsubscribe = wsService.onMessage((message) => {
  console.log('New message:', message);
});

// Cleanup
unsubscribe();
```

### Typing Indicator

```typescript
// Send typing
wsService.sendTypingIndicator(conversationId, true);

// Stop typing
wsService.sendTypingIndicator(conversationId, false);

// Listen for typing
const unsubscribe = wsService.onTyping(conversationId, (data) => {
  console.log(`${data.userName} is typing...`);
});
```

### Read Receipts

```typescript
// Mark message as read
wsService.markAsRead(messageId);

// Listen for delivery/read updates
const unsubscribe = wsService.onDelivery((data) => {
  console.log(`Message ${data.messageId} is ${data.status}`);
});
```

### Presence Updates

```typescript
// Update your presence
wsService.updatePresence('ONLINE'); // or 'AWAY', 'OFFLINE'

// Listen for others' presence
const unsubscribe = wsService.onPresence((data) => {
  console.log(`${data.userId} is ${data.status}`);
});
```

### Connection Status

```typescript
const unsubscribe = wsService.onConnectionChange((connected) => {
  if (connected) {
    console.log('Connected to WebSocket');
  } else {
    console.log('Disconnected from WebSocket');
  }
});
```

---

## 🔒 Authentication

WebSocket connections are authenticated using:
- **JSESSIONID cookie** - Shared with HTTP session
- **X-User-Id header** - User ID passed during connection

If authentication fails, user is redirected to `/login`.

---

## 📊 Message Flow

```
1. User types message
   ↓
2. wsService.sendMessage() called
   ↓
3. Optimistic UI update (SENDING status)
   ↓
4. WebSocket sends to /app/chat.send
   ↓
5. Server processes and saves to DB
   ↓
6. Server sends to recipient /user/{id}/queue/messages
   ↓
7. Sender receives confirmation (SENT status)
   ↓
8. Recipient receives message
   ↓
9. Recipient's UI auto-sends read receipt
   ↓
10. Sender receives read receipt (READ status)
```

**Total latency**: ~50-100ms (local)

---

## 🧪 Testing

### Test WebSocket Connection

Open browser console on messages page:

```javascript
// Check connection status
console.log('Connected:', wsService.isConnected());

// Manual send
wsService.sendMessage('conv123', 'user456', 'Test message');

// Manual typing
wsService.sendTypingIndicator('conv123', true);
```

### Test API Endpoints

```bash
# Get conversations
curl http://localhost:3000/api/messages \
  -H "Cookie: JSESSIONID=your-session-id"

# Get messages for conversation
curl http://localhost:3000/api/messages/conversations/123/messages \
  -H "Cookie: JSESSIONID=your-session-id"

# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=your-session-id" \
  -d '{"recipientId":"user456","productId":"prod789","content":"Hello!"}'
```

---

## 🐛 Troubleshooting

### Issue: WebSocket not connecting

**Solution**:
1. Check backend server is running on `http://localhost:8080`
2. Verify WebSocket endpoint is `/ws`
3. Check browser console for errors
4. Ensure CORS is configured on backend

### Issue: Messages not sending

**Solution**:
1. Check user is authenticated
2. Verify conversation exists
3. Check WebSocket connection status
4. Look for errors in browser console

### Issue: Typing indicator not working

**Solution**:
1. Ensure both users are in same conversation
2. Check WebSocket is connected
3. Verify subscription to typing topic

### Issue: Auto-reconnection failing

**Solution**:
1. Check network connectivity
2. Verify backend is accessible
3. Check browser console for reconnection attempts
4. Max reconnection attempts is 5

---

## 🎯 Best Practices

### Performance

1. **Debounce typing indicators** - Wait 2s before stopping typing
2. **Optimistic updates** - Show message immediately, confirm later
3. **Lazy load messages** - Load older messages on scroll
4. **Cleanup subscriptions** - Always unsubscribe in useEffect cleanup

### UX

1. **Show connection status** - Display "Reconnecting..." when disconnected
2. **Disable input when offline** - Prevent message sending when disconnected
3. **Auto-scroll to bottom** - When new messages arrive
4. **Mark as read automatically** - When user views message

### Error Handling

1. **Graceful degradation** - Show error messages, allow retry
2. **Connection recovery** - Auto-reconnect with exponential backoff
3. **Message queuing** - Queue messages when offline (future enhancement)

---

## 🚀 Future Enhancements

- [ ] **Image/File uploads** - Send images and files
- [ ] **Voice messages** - Record and send audio
- [ ] **Message reactions** - React with emojis
- [ ] **Message deletion** - Delete sent messages
- [ ] **Message search** - Search conversations and messages
- [ ] **Push notifications** - Browser notifications for new messages
- [ ] **Message encryption** - End-to-end encryption
- [ ] **Group chats** - Multi-user conversations
- [ ] **Video/Audio calls** - WebRTC integration

---

## 📚 Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **STOMP.js** - WebSocket protocol
- **SockJS** - WebSocket fallback
- **Spring Boot** - Backend server
- **PostgreSQL** - Database

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is part of DealHarbor - Student Marketplace Platform.

---

**Built with ❤️ for seamless student-to-student communication**
