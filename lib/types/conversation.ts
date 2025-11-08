// lib/types/conversation.ts

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImageUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
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
  isOwn: boolean;
}
