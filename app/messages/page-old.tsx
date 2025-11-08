'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/messages', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);

        // Auto-select conversation from URL or first one
        const conversationId = searchParams.get('conversationId');
        const sellerId = searchParams.get('sellerId');
        const productId = searchParams.get('productId');
        
        if (conversationId) {
          const conv = data.find((c: Conversation) => c.id === conversationId);
          if (conv) setSelectedConversation(conv);
        } else if (sellerId) {
          const conv = data.find((c: Conversation) => c.participantId === sellerId);
          if (conv) {
            setSelectedConversation(conv);
          } else {
            // Create placeholder - fetch product details if productId provided
            let productTitle = 'Product';
            let productPrice = 0;
            let productImageUrl = undefined;
            let sellerName = 'Seller';
            
            if (productId) {
              try {
                const productRes = await fetch(`/api/products/${productId}`, {
                  credentials: 'include',
                });
                
                if (productRes.ok) {
                  const product = await productRes.json();
                  productTitle = product.title;
                  productPrice = product.price;
                  productImageUrl = product.images?.[0];
                  sellerName = product.seller?.name || product.seller?.firstName + ' ' + product.seller?.lastName || 'Seller';
                }
              } catch (error) {
                console.error('Error fetching product:', error);
              }
            }

            const placeholder: Conversation = {
              id: 'new-' + sellerId,
              participantId: sellerId,
              participantName: sellerName,
              participantAvatar: undefined,
              lastMessage: undefined,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
              productId: productId || '',
              productTitle: productTitle,
              productPrice: productPrice,
              productImageUrl: productImageUrl,
              isOnline: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            // Add placeholder to conversations list so it shows in sidebar
            setConversations([placeholder, ...data]);
            setSelectedConversation(placeholder);
          }
        } else if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchParams, selectedConversation]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/messages/conversations/${conversationId}/messages`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const messagesWithOwnership = data.map((msg: any) => ({
          ...msg,
          isOwn: msg.senderId === user.id,
        }));
        setMessages(messagesWithOwnership);

        // Mark unread messages as read
        const unreadMessages = messagesWithOwnership.filter(
          (msg: ConversationMessage) => !msg.isOwn && msg.status !== 'READ'
        );
        unreadMessages.forEach((msg: ConversationMessage) => {
          wsService.markAsRead(msg.id);
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    wsService.connect(user.id);

    // Setup WebSocket event handlers
    const unsubscribeMessage = wsService.onMessage((message) => {
      // Add message to the list if it belongs to the selected conversation
      if (message.conversationId === selectedConversation?.id) {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            isOwn: message.senderId === user.id,
          },
        ]);

        // Mark as read if not own message
        if (message.senderId !== user.id) {
          wsService.markAsRead(message.id);
        }
      }

      // Update conversation list with last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageTime: message.timestamp,
                unreadCount:
                  message.senderId !== user.id && conv.id !== selectedConversation?.id
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
              }
            : conv
        )
      );
    });

    const unsubscribePresence = wsService.onPresence((data) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.status === 'ONLINE') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });

      // Update conversation last seen
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === data.userId
            ? {
                ...conv,
                isOnline: data.status === 'ONLINE',
                lastSeen: data.lastSeen,
              }
            : conv
        )
      );
    });

    const unsubscribeDelivery = wsService.onDelivery((data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, status: data.status, readAt: data.timestamp }
            : msg
        )
      );
    });

    const unsubscribeConnection = wsService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessage();
      unsubscribePresence();
      unsubscribeDelivery();
      unsubscribeConnection();
      wsService.disconnect();
    };
  }, [user, selectedConversation]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);

      // Subscribe to typing indicators for this conversation
      const unsubscribe = wsService.onTyping(selectedConversation.id, (data) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.isTyping);
          return newMap;
        });

        // Clear typing after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        }, 3000);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [selectedConversation, fetchMessages]);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedConversation || !user) return;

      try {
        // For new conversations, pass the productId
        const productId = selectedConversation.id.startsWith('new-') 
          ? selectedConversation.productId 
          : undefined;
          
        const tempId = wsService.sendMessage(
          selectedConversation.id,
          selectedConversation.participantId,
          content,
          'TEXT',
          productId
        );

        // Optimistically add message to UI
        const tempMessage: ConversationMessage = {
          id: tempId,
          conversationId: selectedConversation.id,
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          recipientId: selectedConversation.participantId,
          content,
          type: 'TEXT',
          status: 'SENDING',
          timestamp: new Date().toISOString(),
          isOwn: true,
        };

        setMessages((prev) => [...prev, tempMessage]);

        // Update conversation list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: content,
                  lastMessageTime: tempMessage.timestamp,
                }
              : conv
          )
        );
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [selectedConversation, user]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedConversation) return;
      wsService.sendTypingIndicator(selectedConversation.id, isTyping);
    },
    [selectedConversation]
  );

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('conversationId', conversation.id);
    window.history.pushState({}, '', url);

    // Mark messages as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  if (authLoading || isLoading) {
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

  // Generate template message for new conversations
  const initialMessage = selectedConversation?.id.startsWith('new-') && messages.length === 0
    ? `Hi! I'm interested in buying "${selectedConversation.productTitle}". Is it still available?`
    : undefined;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#FEF5F6] via-white to-[#FEF5F6]">
      <ConnectionStatus isConnected={isConnected} />
      
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onlineUsers={onlineUsers}
      />

      {selectedConversation ? (
        <ChatArea
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          isTyping={typingUsers.get(selectedConversation.participantId) || false}
          isConnected={isConnected}
          initialMessage={initialMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur">
          <EmptyState type="select-conversation" />
        </div>
      )}
    </div>
  );
}
