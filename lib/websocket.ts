// lib/websocket.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
  readAt?: string;
}

interface DeliveryConfirmation {
  messageId: string;
  status: 'DELIVERED' | 'READ';
  timestamp: string;
}

interface PresenceUpdate {
  userId: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen?: string;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

type MessageCallback = (message: Message) => void;
type DeliveryCallback = (confirmation: DeliveryConfirmation) => void;
type PresenceCallback = (update: PresenceUpdate) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketService {
  private client: Client | null = null;
  private userId: string | null = null;
  private subscriptions: Map<string, any> = new Map();
  private messageCallbacks: Set<MessageCallback> = new Set();
  private deliveryCallbacks: Set<DeliveryCallback> = new Set();
  private presenceCallbacks: Set<PresenceCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string) {
    if (this.client?.active) {
      console.log('✅ WebSocket already connected');
      return;
    }

    this.userId = userId;
    console.log(`🔌 Connecting WebSocket for user: ${userId}`);

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ws`),
      connectHeaders: {
        'X-User-Id': userId,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[STOMP]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.subscribeToChannels();
        this.updatePresence('ONLINE');
        this.notifyConnectionCallbacks(true);
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket error:', frame.headers['message'], frame.body);
        this.notifyConnectionCallbacks(false);
      },
      onWebSocketClose: () => {
        console.log('🔌 WebSocket closed');
        this.notifyConnectionCallbacks(false);
        this.handleReconnect();
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        this.notifyConnectionCallbacks(false);
      },
    });

    this.client.activate();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private subscribeToChannels() {
    if (!this.client || !this.userId) return;

    // Clean up old subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();

    // Subscribe to personal message queue
    const messageSub = this.client.subscribe(`/user/${this.userId}/queue/messages`, (message) => {
      try {
        const data: Message = JSON.parse(message.body);
        console.log('📨 [WebSocket] New message received via /user/queue/messages:', {
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content?.substring(0, 50) + '...',
          timestamp: data.timestamp
        });
        console.log('📨 [WebSocket] Notifying', this.messageCallbacks.size, 'message callbacks');
        this.notifyMessageCallbacks(data);
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
    this.subscriptions.set('messages', messageSub);

    // Subscribe to typing indicators
    const typingSub = this.client.subscribe(`/user/${this.userId}/queue/typing`, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('✍️ Typing indicator:', data);
        window.dispatchEvent(new CustomEvent('websocket-typing', { detail: data }));
      } catch (error) {
        console.error('Error parsing typing indicator:', error);
      }
    });
    this.subscriptions.set('typing', typingSub);

    // Subscribe to presence updates (online/offline status)
    const presenceSub = this.client.subscribe(`/user/${this.userId}/queue/presence`, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('👤 [WebSocket] Personal presence update:', data);
        this.notifyPresenceCallbacks(data);
        window.dispatchEvent(new CustomEvent('websocket-presence', { detail: data }));
      } catch (error) {
        console.error('❌ Error parsing presence update:', error);
      }
    });
    this.subscriptions.set('presence', presenceSub);

    // Subscribe to GLOBAL presence updates (all users online/offline)
    const globalPresenceSub = this.client.subscribe('/topic/presence', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('🌍 [WebSocket] Global presence update:', data);
        console.log('🌍 [WebSocket] Notifying', this.presenceCallbacks.size, 'presence callbacks');
        this.notifyPresenceCallbacks(data);
        window.dispatchEvent(new CustomEvent('websocket-presence', { detail: data }));
      } catch (error) {
        console.error('❌ Error parsing global presence update:', error);
      }
    });
    this.subscriptions.set('globalPresence', globalPresenceSub);

    // Subscribe to read receipts / delivery confirmations
    const receiptSub = this.client.subscribe(`/user/${this.userId}/queue/receipts`, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('✅ Read receipt received:', data);
        this.notifyDeliveryCallbacks(data);
        window.dispatchEvent(new CustomEvent('websocket-receipt', { detail: data }));
      } catch (error) {
        console.error('Error parsing read receipt:', error);
      }
    });
    this.subscriptions.set('receipts', receiptSub);

    console.log('✅ Subscribed to all WebSocket channels (including global presence)');
  }

  sendMessage(conversationId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): void {
    if (!this.client?.active) {
      console.warn('⚠️ WebSocket not connected, message will be sent via REST API');
      throw new Error('WebSocket not connected');
    }

    const message = {
      conversationId,
      content,
      messageType: type,
      timestamp: new Date().toISOString(),
    };

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });
      console.log('📤 Message sent via WebSocket:', message);
    } catch (error) {
      console.error('❌ Error sending message via WebSocket:', error);
      throw error;
    }
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean = true) {
    if (!this.client?.active) return;

    try {
      this.client.publish({
        destination: `/app/chat.typing/${conversationId}`,
        body: JSON.stringify({
          conversationId,
          isTyping,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  markAsRead(conversationId: string, messageIds: string[]) {
    if (!this.client?.active || !messageIds.length) return;

    try {
      this.client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          conversationId,
          messageIds,
        }),
      });
      console.log('✅ Marked messages as read:', messageIds);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  updatePresence(status: 'ONLINE' | 'OFFLINE' | 'TYPING') {
    if (!this.client?.active || !this.userId) return;

    try {
      this.client.publish({
        destination: '/app/presence',
        body: JSON.stringify({
          userId: this.userId,
          status,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log('👤 Presence updated:', status);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  disconnect() {
    if (this.client) {
      console.log('🔌 Disconnecting WebSocket...');
      this.updatePresence('OFFLINE');
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.notifyConnectionCallbacks(false);
    }
  }

  // Callback management
  onMessage(callback: MessageCallback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onDelivery(callback: DeliveryCallback) {
    this.deliveryCallbacks.add(callback);
    return () => this.deliveryCallbacks.delete(callback);
  }

  onPresence(callback: PresenceCallback) {
    this.presenceCallbacks.add(callback);
    return () => this.presenceCallbacks.delete(callback);
  }

  onConnection(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  private notifyMessageCallbacks(message: Message) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private notifyDeliveryCallbacks(confirmation: DeliveryConfirmation) {
    this.deliveryCallbacks.forEach(callback => callback(confirmation));
  }

  private notifyPresenceCallbacks(update: PresenceUpdate) {
    this.presenceCallbacks.forEach(callback => callback(update));
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  get isConnected(): boolean {
    return this.client?.active || false;
  }
}

export const webSocketClient = new WebSocketService();
export const wsService = webSocketClient; // Backward compatibility
export default webSocketClient;
