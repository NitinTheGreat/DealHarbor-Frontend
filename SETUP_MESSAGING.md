# 🚀 Quick Setup Guide - DealHarbor Messaging

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Spring Boot backend running on `http://localhost:8080`
- ✅ Backend WebSocket endpoint configured at `/ws`
- ✅ PostgreSQL database setup

---

## Installation

### 1. Install Dependencies

```bash
npm install sockjs-client @stomp/stompjs
npm install --save-dev @types/sockjs-client
```

### 2. Configure Environment

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Verify Backend Configuration

Ensure your Spring Boot `application.properties` has:

```properties
# WebSocket Configuration
spring.websocket.message-size-limit=128KB
spring.websocket.send-buffer-size-limit=512KB

# CORS (for development)
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

---

## Start Application

### 1. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Verify WebSocket is running:
- Check `http://localhost:8080/ws` is accessible

### 2. Start Frontend

```bash
npm run dev
```

Visit `http://localhost:3000/messages`

---

## Test the System

### 1. Login

Navigate to `http://localhost:3000/login` and login with a test account.

### 2. Access Messages

Go to `http://localhost:3000/messages` - you should see the messages interface.

### 3. Test Chat from Product Page

1. Go to any product page: `http://localhost:3000/products/{id}`
2. Click **"Chat with Seller"** button
3. You should be redirected to messages with a new conversation

### 4. Test Real-Time Features

Open two browser windows side-by-side:
- Window 1: Login as User A
- Window 2: Login as User B

Send messages between them and observe:
- ✅ Messages appear instantly
- ✅ Typing indicators show when typing
- ✅ Read receipts update (✓✓)
- ✅ Online status updates

---

## Common Issues & Solutions

### Issue: WebSocket connection fails

**Error**: `WebSocket connection to 'ws://localhost:8080/ws' failed`

**Solution**:
1. Verify backend is running: `curl http://localhost:8080/actuator/health`
2. Check CORS configuration in backend
3. Ensure `/ws` endpoint is not blocked by security config

### Issue: "Unauthorized" error

**Error**: 401 Unauthorized when accessing `/api/messages`

**Solution**:
1. Ensure user is logged in
2. Check JSESSIONID cookie is present
3. Verify session is valid in backend

### Issue: Messages not sending

**Error**: Messages stuck in "SENDING" status

**Solution**:
1. Check WebSocket connection status (look for green "Connected" badge)
2. Open browser console and check for errors
3. Verify backend message handler is working
4. Check database tables are created

### Issue: Typing indicator not showing

**Solution**:
1. Ensure both users are in the same conversation
2. Check WebSocket subscription to typing topic
3. Verify typing events are being sent to backend

---

## Database Schema

Ensure these tables exist in PostgreSQL:

```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    participant_id VARCHAR(255),
    participant_name VARCHAR(255),
    participant_avatar VARCHAR(500),
    product_id UUID,
    product_title VARCHAR(255),
    product_price DECIMAL(10,2),
    product_image_url VARCHAR(500),
    last_message TEXT,
    last_message_time TIMESTAMP,
    unread_count INT DEFAULT 0,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    sender_id VARCHAR(255),
    sender_name VARCHAR(255),
    recipient_id VARCHAR(255),
    content TEXT,
    type VARCHAR(20) DEFAULT 'TEXT',
    status VARCHAR(20) DEFAULT 'SENT',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_participant ON conversations(participant_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

---

## API Endpoints to Verify

Test these endpoints manually:

### 1. Get Conversations

```bash
curl http://localhost:3000/api/messages \
  -H "Cookie: JSESSIONID=your-session-cookie"
```

Expected: Array of conversation objects

### 2. Get Messages

```bash
curl http://localhost:3000/api/messages/conversations/{id}/messages \
  -H "Cookie: JSESSIONID=your-session-cookie"
```

Expected: Array of message objects

### 3. Send Message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=your-session-cookie" \
  -d '{
    "recipientId": "user456",
    "productId": "prod789",
    "content": "Hello, is this available?"
  }'
```

Expected: Created message/conversation object

---

## WebSocket Testing

### Browser Console Testing

Open browser console on `/messages` page:

```javascript
// 1. Check connection
console.log('WebSocket connected:', wsService.isConnected());

// 2. Send test message
wsService.sendMessage('conv-123', 'user-456', 'Test message');

// 3. Listen for messages
wsService.onMessage((msg) => console.log('Received:', msg));

// 4. Test typing
wsService.sendTypingIndicator('conv-123', true);
setTimeout(() => wsService.sendTypingIndicator('conv-123', false), 2000);

// 5. Check presence
wsService.updatePresence('ONLINE');
```

---

## Performance Checklist

- [ ] Backend thread pool configured (8-16 threads)
- [ ] Redis caching enabled (optional but recommended)
- [ ] WebSocket heartbeat set to 10s
- [ ] Message size limit set to 128KB
- [ ] Auto-reconnection working (max 5 attempts)
- [ ] Messages load in < 500ms
- [ ] Real-time latency < 100ms

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables set correctly
- [ ] WebSocket URL uses `wss://` (secure)
- [ ] CORS configured for production domain
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Rate limiting implemented
- [ ] Error logging setup
- [ ] Monitoring/analytics integrated
- [ ] Load balancer supports WebSocket (sticky sessions)
- [ ] SSL/TLS certificates installed

---

## Next Steps

1. ✅ **Customize UI** - Adjust colors, fonts, and layouts
2. ✅ **Add features** - File uploads, reactions, etc.
3. ✅ **Optimize** - Add caching, pagination, lazy loading
4. ✅ **Test** - Write unit and integration tests
5. ✅ **Deploy** - Set up CI/CD pipeline

---

## Getting Help

- 📖 Read `MESSAGING_GUIDE.md` for detailed documentation
- 🐛 Check browser console for errors
- 🔍 Enable debug mode in WebSocket service
- 📧 Contact: support@dealharbor.com

---

**Happy Coding! 🎉**
