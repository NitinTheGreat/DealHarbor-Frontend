// lib/websocket.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface Message {
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

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface PresenceUpdate {
  userId: string;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeen: string;
}

export interface DeliveryConfirmation {
  messageId: string;
  status: 'DELIVERED' | 'READ';
  timestamp: string;
}

class WebSocketService {
  private client: Client | null = null;
  private userId: string | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageCallbacks: Set<(message: Message) => void> = new Set();
  private typingCallbacks: Map<string, Set<(data: TypingIndicator) => void>> = new Map();
  private presenceCallbacks: Set<(data: PresenceUpdate) => void> = new Set();
  private deliveryCallbacks: Set<(data: DeliveryConfirmation) => void> = new Set();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string) {
    if (this.client?.active) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.reconnectAttempts = 0;

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
        console.log('📨 New message received:', data);
        this.notifyMessageCallbacks(data);
      } catch (error) {
        console.error('Error parsing message:', error);
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
        console.log('👤 Presence update:', data);
        window.dispatchEvent(new CustomEvent('websocket-presence', { detail: data }));
      } catch (error) {
        console.error('Error parsing presence update:', error);
      }
    });
    this.subscriptions.set('presence', presenceSub);

    console.log('✅ Subscribed to all WebSocket channels');
  }
    const receiptSub = this.client.subscribe(`/user/${this.userId}/queue/receipts`, (message) => {
      try {
        const data: DeliveryConfirmation = JSON.parse(message.body);
        console.log('👀 Message read:', data);
        this.notifyDeliveryCallbacks(data);
      } catch (error) {
        console.error('Error parsing receipt:', error);
      }
    });
    this.subscriptions.set('receipts', receiptSub);

    // Subscribe to presence updates
    const presenceSub = this.client.subscribe('/topic/presence', (message) => {
      try {
        const data: PresenceUpdate = JSON.parse(message.body);
        this.notifyPresenceCallbacks(data);
      } catch (error) {
        console.error('Error parsing presence:', error);
      }
    });
    this.subscriptions.set('presence', presenceSub);

    // Subscribe to errors
    const errorSub = this.client.subscribe(`/user/${this.userId}/queue/errors`, (message) => {
      console.error('❌ Server error:', message.body);
    });
    this.subscriptions.set('errors', errorSub);

    // Send connection event
    this.client.publish({
      destination: '/app/user.connect',
      body: JSON.stringify({ userId: this.userId }),
    });

    // Update presence to ONLINE
    this.updatePresence('ONLINE');
  }

  sendMessage(conversationId: string, recipientId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT', productId?: string): string {
    if (!this.client?.active) {
      console.error('❌ WebSocket not connected');
      throw new Error('WebSocket not connected');
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    // For new conversations (ID starts with 'new-'), don't send the conversationId
    // Let the backend create it
    const message: any = {
      id: tempId,
      recipientId,
      content,
      type,
      status: 'SENDING',
      timestamp: new Date().toISOString(),
    };
    
    // Only include conversationId if it's a real conversation (not a placeholder)
    if (!conversationId.startsWith('new-')) {
      message.conversationId = conversationId;
    }
    
    // Include productId if provided (for first message about a product)
    if (productId) {
      message.productId = productId;
    }

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });
      return tempId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToTyping(conversationId: string, callback: (data: TypingIndicator) => void) {
    if (!this.client?.active) return;

    const subKey = `typing-${conversationId}`;
    
    // Unsubscribe if already subscribed
    if (this.subscriptions.has(subKey)) {
      this.subscriptions.get(subKey)?.unsubscribe();
    }

    const sub = this.client.subscribe(`/topic/typing/${conversationId}`, (message) => {
      try {
        const data: TypingIndicator = JSON.parse(message.body);
        // Don't notify about own typing
        if (data.userId !== this.userId) {
          callback(data);
        }
      } catch (error) {
        console.error('Error parsing typing indicator:', error);
      }
    });

    this.subscriptions.set(subKey, sub);
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (!this.client?.active || !this.userId) return;

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

  markAsRead(messageId: string) {
    if (!this.client?.active) return;

    try {
      this.client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          id: messageId,
        }),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  updatePresence(status: 'ONLINE' | 'AWAY' | 'OFFLINE') {
    if (!this.client?.active) return;

    try {
      this.client.publish({
        destination: '/app/user.presence',
        body: JSON.stringify({
          status,
          lastSeen: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  // Callback management
  onMessage(callback: (message: Message) => void) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onTyping(conversationId: string, callback: (data: TypingIndicator) => void) {
    if (!this.typingCallbacks.has(conversationId)) {
      this.typingCallbacks.set(conversationId, new Set());
    }
    this.typingCallbacks.get(conversationId)!.add(callback);
    
    // Subscribe to typing for this conversation
    this.subscribeToTyping(conversationId, callback);

    return () => {
      const callbacks = this.typingCallbacks.get(conversationId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.typingCallbacks.delete(conversationId);
        }
      }
    };
  }

  onPresence(callback: (data: PresenceUpdate) => void) {
    this.presenceCallbacks.add(callback);
    return () => this.presenceCallbacks.delete(callback);
  }

  onDelivery(callback: (data: DeliveryConfirmation) => void) {
    this.deliveryCallbacks.add(callback);
    return () => this.deliveryCallbacks.delete(callback);
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  private notifyMessageCallbacks(message: Message) {
    this.messageCallbacks.forEach(cb => {
      try {
        cb(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  private notifyPresenceCallbacks(data: PresenceUpdate) {
    this.presenceCallbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error in presence callback:', error);
      }
    });
  }

  private notifyDeliveryCallbacks(data: DeliveryConfirmation) {
    this.deliveryCallbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('Error in delivery callback:', error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(cb => {
      try {
        cb(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    this.updatePresence('OFFLINE');
    
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    
    // Deactivate client
    this.client?.deactivate();
    this.client = null;
    this.userId = null;
    
    // Clear callbacks
    this.messageCallbacks.clear();
    this.typingCallbacks.clear();
    this.presenceCallbacks.clear();
    this.deliveryCallbacks.clear();
    this.connectionCallbacks.clear();
  }

  isConnected(): boolean {
    return this.client?.active ?? false;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
