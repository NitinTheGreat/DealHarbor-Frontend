// app/messages/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/ClientAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { webSocketClient } from '@/lib/websocket';
import ConversationListNew from './components/ConversationListNew';
import ChatWindow from './components/ChatWindow';
import SellerSearch from './components/SellerSearch';
import EmptyState from './components/EmptyState';
import ConnectionStatus from './components/ConnectionStatus';
import { Loader2, MessageSquarePlus } from 'lucide-react';

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showSellerSearch, setShowSellerSearch] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Handle ?sellerId=xxx&productId=xxx URL parameters for direct chat
  useEffect(() => {
    const handleDirectChat = async () => {
      const sellerId = searchParams.get('sellerId');
      const productId = searchParams.get('productId');

      if (sellerId && user) {
        try {
          console.log('[MessagesPage] Creating/getting conversation with seller:', sellerId);
          
          // Build URL with optional productId
          let url = `/api/messages/conversation-with-seller/${sellerId}`;
          if (productId) {
            url += `?productId=${productId}`;
          }

          const response = await fetch(url, {
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to get conversation with seller');
          }

          const conversation = await response.json();
          console.log('[MessagesPage] Got conversation:', conversation);

          // Set the conversation as selected
          setSelectedConversationId(conversation.id);

          // Clean URL (remove sellerId/productId params)
          const url_obj = new URL(window.location.href);
          url_obj.searchParams.delete('sellerId');
          url_obj.searchParams.delete('productId');
          window.history.replaceState({}, '', url_obj);

          // Trigger conversation list refresh
          setRefreshKey((prev) => prev + 1);
        } catch (error) {
          console.error('[MessagesPage] Error handling direct chat:', error);
        }
      }

      setIsLoading(false);
    };

    if (!authLoading && user) {
      handleDirectChat();
    }
  }, [searchParams, user, authLoading]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    console.log('[MessagesPage] Connecting to WebSocket...');
    webSocketClient.connect(user.id);

    // Setup WebSocket event handlers
    webSocketClient.onConnection((connected: boolean) => {
      console.log('[MessagesPage] Connection status:', connected);
      setIsConnected(connected);
    });

    // Handle incoming messages - trigger conversation list refresh
    webSocketClient.onMessage((message: any) => {
      console.log('[MessagesPage] New message received:', message);
      // Don't refresh if we're viewing the conversation - let ChatWindow handle it
      if (message.conversationId !== selectedConversationId) {
        setRefreshKey((prev) => prev + 1);
      }
    });

    // Handle presence updates
    webSocketClient.onPresence((data: any) => {
      console.log('[MessagesPage] Presence update:', data);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.status === 'ONLINE') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // Cleanup on unmount
    return () => {
      console.log('[MessagesPage] Disconnecting WebSocket');
      webSocketClient.disconnect();
    };
  }, [user?.id, selectedConversationId]);

  // Handle seller selection from search modal
  const handleSelectSeller = useCallback(async (
    sellerId: string,
    hasExisting: boolean,
    existingConvId?: string
  ) => {
    console.log('[MessagesPage] Seller selected:', { sellerId, hasExisting, existingConvId });

    if (hasExisting && existingConvId) {
      // Use existing conversation
      setSelectedConversationId(existingConvId);
    } else {
      // Create new conversation (backend will handle)
      try {
        const response = await fetch(
          `/api/messages/conversation-with-seller/${sellerId}`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }

        const conversation = await response.json();
        console.log('[MessagesPage] Created conversation:', conversation);
        setSelectedConversationId(conversation.id);

        // Trigger conversation list refresh
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('[MessagesPage] Error creating conversation:', error);
      }
    }

    setShowSellerSearch(false);
  }, []);

  // Handle conversation selection from list
  const handleSelectConversation = useCallback((conversationId: string) => {
    console.log('[MessagesPage] Conversation selected:', conversationId);
    setSelectedConversationId(conversationId);
  }, []);

  if (authLoading || (isLoading && searchParams.get('sellerId'))) {
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
      
      {/* Conversation List Sidebar */}
      <div className="w-full lg:w-96 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col">
        {/* Header with New Chat Button */}
        <div className="p-4 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h1
              className="text-2xl font-bold text-[#2D3748]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Messages
            </h1>
            <button
              onClick={() => setShowSellerSearch(true)}
              className="p-2 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-xl hover:shadow-lg transition-all"
              title="Start new chat"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationListNew
            activeConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onlineUsers={onlineUsers}
            refreshKey={refreshKey}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden lg:flex flex-1">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur">
            <EmptyState type="select-conversation" />
          </div>
        )}
      </div>

      {/* Mobile View - Show only chat when conversation is selected */}
      {selectedConversationId && (
        <div className="lg:hidden fixed inset-0 bg-white z-50">
          <ChatWindow
            conversationId={selectedConversationId}
            onBack={() => setSelectedConversationId(null)}
          />
        </div>
      )}

      {/* Seller Search Modal */}
      {showSellerSearch && (
        <SellerSearch
          onSelectSeller={handleSelectSeller}
          onClose={() => setShowSellerSearch(false)}
        />
      )}
    </div>
  );
}
