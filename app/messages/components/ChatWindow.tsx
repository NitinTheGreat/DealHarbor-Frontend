// app/messages/components/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Loader2, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/components/ClientAuth';
import { webSocketClient } from '@/lib/websocket';

interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  timestamp?: string;
  createdAt?: string; // Backend uses this
  status?: 'SENT' | 'DELIVERED' | 'READ';
  isRead?: boolean;
  read?: boolean; // Backend uses this
  readAt?: string | null;
}

// Helper to normalize message from backend format
function normalizeMessage(msg: any): Message {
  // Create a stable id even if backend omits id occasionally
  const fallbackId = `${String(msg.conversationId ?? 'conv')}-${String(
    msg.timestamp || msg.createdAt || Date.now()
  )}-${String(msg.senderId ?? 'unknown')}`;

  const normalized: Message = {
    // Prefer server-provided id; otherwise generate a deterministic fallback
    id: String(msg.id ?? msg.messageId ?? fallbackId),
    conversationId: msg.conversationId ?? msg.conversation?.id,
    senderId: String(msg.senderId ?? msg.fromUserId ?? ''),
    content: String(msg.content ?? ''),
    messageType: (msg.messageType || msg.type || 'TEXT') as 'TEXT' | 'IMAGE' | 'FILE',
    timestamp: msg.timestamp || msg.createdAt,
    createdAt: msg.createdAt,
    isRead: msg.isRead ?? msg.read ?? false,
    status: (msg.status || (msg.read ? 'READ' : 'SENT')) as 'SENT' | 'DELIVERED' | 'READ',
    read: msg.read,
    readAt: msg.readAt ?? null,
  };

  return normalized;
}

interface Participant {
  userId?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  lastSeen?: string;
  onlineStatus?: 'ONLINE' | 'OFFLINE';
}

interface ProductContext {
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
}

interface ConversationDetails {
  id: string;
  participants?: Participant[];
  // Backend actually returns these fields:
  otherUserId?: string;
  otherUserName?: string;
  otherUserProfilePhotoUrl?: string;
  isOnline?: boolean; // Backend now provides this
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  product?: ProductContext;
  productId?: string;
  productTitle?: string;
  productImageUrl?: string;
  productPrice?: number;
}

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
}

export default function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Cache presence updates in case they arrive before conversation/participant are ready
  const presenceCacheRef = useRef<Map<string, { status: 'ONLINE' | 'OFFLINE'; lastSeen?: string }>>(new Map());

  // DEBUG: Expose function to test message updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testAddMessage = () => {
        const testMsg = {
          id: 'test-' + Date.now(),
          conversationId: conversationId,
          senderId: 'test-user',
          content: 'Test message from console',
          messageType: 'TEXT' as const,
          timestamp: new Date().toISOString(),
          isRead: false,
          status: 'SENT' as const,
        };
        console.log('[ChatWindow] 🧪 Test: Adding message directly to state:', testMsg);
        setMessages((prev) => [...prev, testMsg]);
      };
      
      (window as any).checkWebSocketStatus = () => {
        console.log('[ChatWindow] 🔍 WebSocket Status Check:');
        console.log('  - Connected:', webSocketClient.isConnected);
        console.log('  - Current User ID:', user?.id);
        console.log('  - Conversation ID:', conversationId);
        console.log('  - Messages Count:', messages.length);
        console.log('  - Other Participant:', otherParticipant);
        return {
          connected: webSocketClient.isConnected,
          userId: user?.id,
          conversationId,
          messageCount: messages.length,
          otherParticipant
        };
      };
      
      console.log('[ChatWindow] 🧪 Debug functions available:');
      console.log('  - window.testAddMessage() - Add a test message');
      console.log('  - window.checkWebSocketStatus() - Check connection status');
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).testAddMessage;
        delete (window as any).checkWebSocketStatus;
      }
    };
  }, [conversationId, user?.id, messages.length]);

  // Get other participant - handle both backend formats
  const [otherParticipant, setOtherParticipant] = useState<Participant | undefined>(undefined);

  useEffect(() => {
    if (!conversation) {
      setOtherParticipant(undefined);
      return;
    }

    const participant = conversation.participants?.find((p) => p.userId !== user?.id) ||
      // Fallback: construct from flat fields if participants array doesn't exist
      (conversation.otherUserId
        ? {
            userId: conversation.otherUserId,
            firstName: conversation.otherUserName?.split(' ')[0] || 'User',
            lastName: conversation.otherUserName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: conversation.otherUserProfilePhotoUrl,
            // Use backend's isOnline field if available, otherwise default to OFFLINE
            onlineStatus: conversation.isOnline ? ('ONLINE' as const) : ('OFFLINE' as const),
          }
        : undefined);

    setOtherParticipant(participant);
  }, [conversation, user?.id]);

  // Debug log - check if we're getting the right participant
  useEffect(() => {
    console.log('[ChatWindow] DEBUG - Current user ID:', user?.id);
    console.log('[ChatWindow] DEBUG - Conversation otherUserId:', conversation?.otherUserId);
    console.log('[ChatWindow] DEBUG - Conversation otherUserName:', conversation?.otherUserName);
    console.log('[ChatWindow] DEBUG - Conversation participants:', conversation?.participants);
    console.log('[ChatWindow] DEBUG - Other participant calculated:', otherParticipant);
    
    // Check if otherUserId matches current user (backend bug)
    if (conversation?.otherUserId === user?.id) {
      console.error('⚠️ BACKEND BUG: otherUserId matches current user ID! Backend should return the OTHER person, not yourself.');
    }
  }, [conversation, user?.id, otherParticipant]);

  // Debug log
  useEffect(() => {
    if (conversation) {
      console.log('[ChatWindow] Conversation data:', conversation);
      console.log('[ChatWindow] Participants:', conversation.participants);
      console.log('[ChatWindow] Current user ID:', user?.id);
      console.log('[ChatWindow] Other participant:', otherParticipant);
    }
  }, [conversation, user?.id, otherParticipant]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation details
  const loadConversationDetails = useCallback(async () => {
    try {
      setError(null);
      console.log('[ChatWindow] Loading conversation:', conversationId);
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load conversation');
      }

      const data = await response.json();
      console.log('[ChatWindow] Conversation details:', data);
      
      // Validate conversation data structure - be more lenient
      if (!data) {
        console.error('[ChatWindow] No data received');
        throw new Error('No conversation data received');
      }
      
      // If participants is missing or empty, log warning but continue
      if (!data.participants || !Array.isArray(data.participants)) {
        console.warn('[ChatWindow] Participants data is missing or invalid:', data.participants);
        // Create a minimal structure to allow the chat to work
        data.participants = data.participants || [];
      }
      
      setConversation(data);
    } catch (error) {
      console.error('[ChatWindow] Error loading conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversation');
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Load messages
  const loadMessages = useCallback(
    async (page = 0, append = false) => {
      try {
        if (page === 0) setLoading(true);
        else setLoadingMore(true);

        console.log('[ChatWindow] Loading messages, page:', page);
        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages?page=${page}&size=20`,
          { credentials: 'include' }
        );

        if (!response.ok) throw new Error('Failed to load messages');

        const data = await response.json();
        console.log('[ChatWindow] Messages loaded:', data);

        const newMessages = (data.content || []).map(normalizeMessage);
        
        if (append) {
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
          setTimeout(scrollToBottom, 100);
        }

        setHasMore(data.totalPages > page + 1);
        setCurrentPage(page);
      } catch (error) {
        console.error('[ChatWindow] Error loading messages:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [conversationId, scrollToBottom]
  );

  // Mark as read
  const markAsRead = useCallback(async () => {
    if (!conversation || conversation.unreadCount === 0) return;

    try {
      console.log('[ChatWindow] Marking conversation as read:', conversationId);
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        credentials: 'include',
      });

      // Also send WebSocket mark as read
      const unreadMessageIds = messages
        .filter((msg) => msg.senderId !== user?.id && !msg.isRead)
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        webSocketClient.markAsRead(conversationId, unreadMessageIds);
      }

      setConversation((prev) => (prev ? { ...prev, unreadCount: 0 } : null));
    } catch (error) {
      console.error('[ChatWindow] Error marking as read:', error);
    }
  }, [conversationId, conversation, messages, user?.id]);

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setSending(true);
    setMessageInput('');

    try {
      console.log('[ChatWindow] Sending message:', content);
      console.log('[ChatWindow] Conversation ID:', conversationId);

      // Try to send via WebSocket if connected
      try {
        if (webSocketClient.isConnected) {
          webSocketClient.sendMessage(conversationId, content, 'TEXT');
          console.log('[ChatWindow] Message sent via WebSocket');
        } else {
          console.warn('[ChatWindow] WebSocket not connected, using REST API only');
        }
      } catch (wsError) {
        console.warn('[ChatWindow] WebSocket send failed, falling back to REST API:', wsError);
      }

      // Always send via REST API as primary/backup
      const response = await fetch(
        `/api/messages/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content,
            messageType: 'TEXT',
          }),
        }
      );

      console.log('[ChatWindow] Send message response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatWindow] Backend error response:', errorText);
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
      }

      const newMessage = await response.json();
      console.log('[ChatWindow] Message sent successfully:', newMessage);

      // Normalize the message format and set initial status as SENT
      const normalizedMessage = {
        ...normalizeMessage(newMessage),
        status: newMessage.status || 'SENT', // Set to SENT initially
      };

      // Add to messages if not already received via WebSocket
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === normalizedMessage.id);
        if (exists) return prev;
        return [...prev, normalizedMessage];
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error);
      // Restore message input on error
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    webSocketClient.sendTypingIndicator(conversationId, true);

    typingTimeoutRef.current = setTimeout(() => {
      webSocketClient.sendTypingIndicator(conversationId, false);
    }, 3000);
  };

  // Initial load
  useEffect(() => {
    loadConversationDetails();
    loadMessages(0, false);
  }, [conversationId, loadConversationDetails, loadMessages]);

  // Mark as read when conversation opens
  useEffect(() => {
    if (conversation && messages.length > 0) {
      const timer = setTimeout(markAsRead, 1000);
      return () => clearTimeout(timer);
    }
  }, [conversation, messages, markAsRead]);

  // WebSocket subscriptions with auto message refresh
  useEffect(() => {
    if (!user?.id || !conversationId) {
      console.log('[ChatWindow] ⏭️ Skipping WebSocket setup - missing user or conversationId:', { userId: user?.id, conversationId });
      return;
    }

    console.log('[ChatWindow] 🔌 Setting up WebSocket listeners for conversation:', conversationId);
    console.log('[ChatWindow] 📊 Current user:', user.id);

    // Handle incoming messages with automatic update
    const handleNewMessage = (message: any) => {
      console.log('[ChatWindow] 📨 New message received:', message);
      console.log('[ChatWindow] 📍 Current conversation ID:', conversationId, 'Type:', typeof conversationId);
      console.log('[ChatWindow] 📍 Message conversation ID:', message.conversationId, 'Type:', typeof message.conversationId);
      
      // Check if message belongs to this conversation (with type coercion for safety)
      const messageConvId = String(message.conversationId);
      const currentConvId = String(conversationId);
      
      if (messageConvId === currentConvId) {
        console.log('[ChatWindow] ✅ Message belongs to this conversation, adding to messages');
        const normalizedMessage = normalizeMessage(message);
        
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === normalizedMessage.id);
          if (exists) {
            console.log('[ChatWindow] ⚠️ Message already exists, skipping');
            return prev;
          }
          console.log('[ChatWindow] 🆕 Adding new message to state, total will be:', prev.length + 1);
          const newMessages = [...prev, normalizedMessage];
          
          // Scroll to bottom immediately for real-time feel
          requestAnimationFrame(() => scrollToBottom());
          
          return newMessages;
        });

        // Mark as read if not own message
        if (normalizedMessage.senderId !== user.id) {
          console.log('[ChatWindow] 👁️ Marking message as read (not from current user)');
          setTimeout(() => markAsRead(), 300);
        }
        
        // DON'T refresh conversation details here - it causes race conditions
        // The conversation list will update via its own WebSocket listener
      } else {
        console.log('[ChatWindow] ❌ Message does NOT belong to this conversation, ignoring');
        console.log(`[ChatWindow] ⚠️ Expected: "${currentConvId}", Got: "${messageConvId}"`);
      }
    };

    // Handle typing indicators via CustomEvent
    const handleTyping = (event: Event) => {
      const data = (event as CustomEvent).detail as { conversationId: string; userId: string; isTyping: boolean };
      console.log('[ChatWindow] Typing indicator:', data);
      if (data.conversationId === conversationId && data.userId !== user.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    // Handle read receipts / delivery confirmations
    const handleReceipt = (event: Event) => {
      const data = (event as CustomEvent).detail as { messageId: string; status: 'DELIVERED' | 'READ'; timestamp: string };
      console.log('[ChatWindow] Read receipt:', data);
      
      // Update message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, status: data.status, isRead: data.status === 'READ', readAt: data.timestamp }
            : msg
        )
      );
    };

    // Handle presence updates
    const handlePresence = (data: { userId: string; status: 'ONLINE' | 'OFFLINE'; lastSeen?: string }) => {
      console.log('[ChatWindow] Presence update received:', data);
      // Always cache the latest presence for any user
      presenceCacheRef.current.set(data.userId, { status: data.status, lastSeen: data.lastSeen });
      
      // Check if this presence update is for the other user in this conversation
      const isOtherUser = otherParticipant?.userId === data.userId || conversation?.otherUserId === data.userId;
      
      console.log('[ChatWindow] Checking presence:', {
        'data.userId': data.userId,
        'otherParticipant?.userId': otherParticipant?.userId,
        'conversation?.otherUserId': conversation?.otherUserId,
        'isOtherUser': isOtherUser
      });
      
      if (isOtherUser) {
        console.log('[ChatWindow] ✅ Presence update is for the other user in this conversation');
        console.log(`[ChatWindow] 🔄 Updating status to: ${data.status}`);
        
        // Update the otherParticipant directly - THIS TRIGGERS HEADER RE-RENDER
        setOtherParticipant((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            onlineStatus: data.status,
            lastSeen: data.lastSeen || prev.lastSeen,
          };
          console.log('[ChatWindow] 👤 Updated otherParticipant:', updated);
          return updated;
        });

        // Also update conversation state to keep everything in sync
        setConversation((prev) => {
          if (!prev) return prev;
          
          const updated = {
            ...prev,
            isOnline: data.status === 'ONLINE',
          };
          
          // Also update participants array if it exists
          if (prev.participants) {
            updated.participants = prev.participants.map((p) =>
              p.userId === data.userId
                ? { ...p, onlineStatus: data.status, lastSeen: data.lastSeen || p.lastSeen }
                : p
            );
          }
          
          console.log('[ChatWindow] 💬 Updated conversation:', updated);
          return updated;
        });
      } else {
        console.log('[ChatWindow] ⏭️ Presence update is for a different user, ignoring');
      }
    };

    // Add callbacks to WebSocket client
    const unsubscribeMessage = webSocketClient.onMessage(handleNewMessage);
    const unsubscribePresence = webSocketClient.onPresence(handlePresence);
    window.addEventListener('websocket-typing', handleTyping);
    window.addEventListener('websocket-receipt', handleReceipt);

    console.log('[ChatWindow] ✅ WebSocket listeners registered successfully');
    console.log('[ChatWindow] 🔗 Message callback registered');
    console.log('[ChatWindow] 🔗 Presence callback registered');

    return () => {
      console.log('[ChatWindow] 🧹 Cleaning up WebSocket listeners');
      unsubscribeMessage();
      unsubscribePresence();
      window.removeEventListener('websocket-typing', handleTyping);
      window.removeEventListener('websocket-receipt', handleReceipt);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      console.log('[ChatWindow] ✅ Cleanup complete');
    };
  }, [conversationId, user?.id, otherParticipant, conversation?.otherUserId, markAsRead, scrollToBottom, loadConversationDetails]);

  // Apply any cached presence update once we know who the other participant is
  useEffect(() => {
    const otherId = otherParticipant?.userId || conversation?.otherUserId;
    if (!otherId) return;

    const cached = presenceCacheRef.current.get(otherId);
    if (!cached) return;

    console.log('[ChatWindow] Applying cached presence for other user:', otherId, cached);
    setOtherParticipant((prev) => (prev ? { ...prev, onlineStatus: cached.status, lastSeen: cached.lastSeen ?? prev.lastSeen } : prev));
    setConversation((prev) => {
      if (!prev) return prev;
      const updated: ConversationDetails = { ...prev, isOnline: cached.status === 'ONLINE' };
      if (prev.participants) {
        updated.participants = prev.participants.map((p) =>
          p.userId === otherId ? { ...p, onlineStatus: cached.status, lastSeen: cached.lastSeen ?? p.lastSeen } : p
        );
      }
      return updated;
    });
  }, [otherParticipant?.userId, conversation?.otherUserId]);

  // Load more messages on scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100) {
      loadMessages(currentPage + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D97E96] mx-auto mb-4" />
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // Only show error if there was an actual error, not just missing data
  if (error && !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-500 text-lg mb-2">Error Loading Conversation</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-400 mb-4">
            Make sure the backend server is running on http://localhost:8080
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-[#D97E96] text-white rounded-xl hover:bg-[#C76D86] transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // Allow chat to render even without full participant data
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500 text-lg mb-4">Conversation not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-[#D97E96] text-white rounded-xl hover:bg-[#C76D86] transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white h-full overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 shadow-sm flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all lg:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Other Participant Info */}
        <div className="flex items-center gap-3 flex-1">
          {otherParticipant ? (
            <>
              {otherParticipant.profileImageUrl ? (
                <img
                  src={otherParticipant.profileImageUrl}
                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D97E96] to-[#E598AD] flex items-center justify-center text-white font-semibold">
                  {otherParticipant.firstName?.charAt(0) || '?'}{otherParticipant.lastName?.charAt(0) || ''}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-[#2D3748]">
                  {otherParticipant.firstName} {otherParticipant.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {otherParticipant.onlineStatus === 'ONLINE' ? (
                    <span className="text-green-600">● Online</span>
                  ) : otherParticipant.lastSeen ? (
                    `Last seen ${formatDistanceToNow(new Date(otherParticipant.lastSeen))} ago`
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">?</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#2D3748]">Loading...</h3>
                <p className="text-sm text-gray-500">Connecting...</p>
              </div>
            </>
          )}
        </div>

        {/* Product Context */}
        {(conversation.product || conversation.productTitle) && (
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {conversation.product?.title || conversation.productTitle}
            </span>
          </div>
        )}
      </div>

      {/* Product Context Mobile */}
      {(conversation.product || conversation.productTitle) && (
        <div className="md:hidden bg-gradient-to-r from-[#D97E96]/10 to-[#E598AD]/10 p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {(conversation.product?.imageUrl || conversation.productImageUrl) && (
              <img
                src={conversation.product?.imageUrl || conversation.productImageUrl}
                alt={conversation.product?.title || conversation.productTitle}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2D3748] truncate">
                {conversation.product?.title || conversation.productTitle}
              </p>
              <p className="text-xs text-gray-500">
                ${(conversation.product?.price || conversation.productPrice || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {loadingMore && (
          <div className="text-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#D97E96] mx-auto" />
          </div>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.senderId === user?.id;
          const isRead = message.isRead || message.status === 'READ';
          const isDelivered = message.status === 'DELIVERED' || isRead;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white'
                    : 'bg-white border border-gray-200 text-[#2D3748]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <div
                  className={`flex items-center gap-1 text-xs mt-1 ${
                    isOwnMessage ? 'text-white/80' : 'text-gray-500'
                  }`}
                >
                  <span>
                    {message.timestamp ? (
                      `${formatDistanceToNow(new Date(message.timestamp))} ago`
                    ) : (
                      'Just now'
                    )}
                  </span>
                  
                  {/* WhatsApp-style read receipts - only for own messages */}
                  {isOwnMessage && (
                    <span className="ml-1 flex-shrink-0">
                      {isRead ? (
                        // Double blue ticks for read - with spacing
                        <svg className="w-5 h-4 inline" viewBox="0 0 20 16" fill="none">
                          <path d="M1 8.5L4.5 12L13 3.5" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 8.5L10.5 12L19 3.5" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : isDelivered ? (
                        // Double white/gray ticks for delivered - with spacing
                        <svg className="w-5 h-4 inline" viewBox="0 0 20 16" fill="none">
                          <path d="M1 8.5L4.5 12L13 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 8.5L10.5 12L19 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        // Single white/gray tick for sent
                        <svg className="w-4 h-4 inline" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator with Animation */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span 
                    className="w-2 h-2 bg-gradient-to-r from-[#D97E96] to-[#E598AD] rounded-full animate-bounce" 
                    style={{ animationDelay: '0ms', animationDuration: '1s' }} 
                  />
                  <span 
                    className="w-2 h-2 bg-gradient-to-r from-[#D97E96] to-[#E598AD] rounded-full animate-bounce" 
                    style={{ animationDelay: '200ms', animationDuration: '1s' }} 
                  />
                  <span 
                    className="w-2 h-2 bg-gradient-to-r from-[#D97E96] to-[#E598AD] rounded-full animate-bounce" 
                    style={{ animationDelay: '400ms', animationDuration: '1s' }} 
                  />
                </div>
                <span className="text-xs text-gray-500 ml-1">typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97E96] transition-all placeholder:text-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim() || sending}
            className="p-3 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
