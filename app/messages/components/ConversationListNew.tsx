// app/messages/components/ConversationListNew.tsx
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { webSocketClient } from '@/lib/websocket';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserProfilePhotoUrl?: string;
  productId?: string;
  productTitle?: string;
  productImageUrl?: string;
  productPrice?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean; // Backend now provides this
}

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onlineUsers?: Set<string>;
  refreshKey?: number; // Trigger refresh
}

export default function ConversationListNew({
  activeConversationId,
  onSelectConversation,
  onlineUsers = new Set(),
  refreshKey,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();

    // Refresh every 30 seconds to catch new conversations
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]); // Re-fetch when refreshKey changes

  // Listen to WebSocket messages to update conversation list in real-time
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      console.log('[ConversationList] New message received, updating list:', message);
      
      // Update the conversation list immediately
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message.content,
              lastMessageAt: message.createdAt || message.timestamp,
              unreadCount: conv.id === activeConversationId ? 0 : conv.unreadCount + 1,
            };
          }
          return conv;
        });
        
        // Sort by lastMessageAt (most recent first)
        return updated.sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
          return dateB - dateA;
        });
      });
    };

    // Handle presence updates to update online status in real-time
    const handlePresence = (event: Event) => {
      const data = (event as CustomEvent).detail as { userId: string; status: string };
      console.log('[ConversationList] Presence update:', data);
      
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.otherUserId === data.userId) {
            return {
              ...conv,
              isOnline: data.status === 'ONLINE',
            };
          }
          return conv;
        })
      );
    };

    webSocketClient.onMessage(handleNewMessage);
    window.addEventListener('websocket-presence', handlePresence);

    return () => {
      window.removeEventListener('websocket-presence', handlePresence);
    };
  }, [activeConversationId]);

  const loadConversations = async () => {
    try {
      setError(null);
      const response = await fetch('/api/messages?page=0&size=50', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      console.log('[ConversationList] Loaded conversations:', data);
      
      // Handle paginated response
      const conversationList = data.content || data || [];
      setConversations(conversationList);
    } catch (err) {
      console.error('[ConversationList] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97E96]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <p className="text-red-500 font-semibold mb-2">Connection Error</p>
        <p className="text-sm text-gray-600 mb-1">{error}</p>
        <p className="text-xs text-gray-400 mb-4">
          Make sure the backend server is running on http://localhost:8080
        </p>
        <button
          onClick={loadConversations}
          className="px-4 py-2 bg-[#D97E96] text-white rounded-lg hover:bg-[#E598AD] transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg mb-2">No conversations yet</p>
        <p className="text-sm">Start a new chat to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelectConversation(conv.id)}
          className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
            activeConversationId === conv.id ? 'bg-gray-100' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Profile Image with Online Status */}
            <div className="relative flex-shrink-0">
              {conv.otherUserProfilePhotoUrl ? (
                <img
                  src={conv.otherUserProfilePhotoUrl}
                  alt={conv.otherUserName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D97E96] to-[#E598AD] flex items-center justify-center text-white font-semibold text-lg">
                  {conv.otherUserName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Show green dot if: backend says isOnline OR onlineUsers set has the user */}
              {(conv.isOnline || onlineUsers.has(conv.otherUserId)) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-[#2D3748] truncate">
                  {conv.otherUserName}
                </span>
                {conv.lastMessageAt && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>

              {/* Product Context (if exists) */}
              {conv.productTitle && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  {conv.productImageUrl && (
                    <img
                      src={conv.productImageUrl}
                      alt={conv.productTitle}
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  <span className="truncate">{conv.productTitle}</span>
                  {conv.productPrice && (
                    <span className="text-[#D97E96] font-semibold flex-shrink-0">
                      ₹{conv.productPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Last Message */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1">
                  {conv.lastMessage || 'No messages yet'}
                </p>

                {/* Unread Badge */}
                {conv.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#D97E96] text-white text-xs rounded-full flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
