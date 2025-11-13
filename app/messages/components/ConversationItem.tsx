// app/messages/components/ConversationItem.tsx
'use client';

import { Conversation } from '@/lib/types/conversation';
import { Check, CheckCheck } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOnline: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isSelected,
  isOnline,
  onClick,
}: ConversationItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover:bg-white/50 transition-all border-b border-white/10 ${
        isSelected ? 'bg-gradient-to-r from-[#D97E96]/10 to-[#E598AD]/10 border-l-4 border-l-[#D97E96]' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {conversation.participantAvatar ? (
          <img
            src={conversation.participantAvatar}
            alt={conversation.participantName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D97E96] to-[#E598AD] flex items-center justify-center text-white font-semibold shadow-lg">
            {getInitials(conversation.participantName)}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg" />
        )}
      </div>

      {/* Conversation Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-[#2D3748] truncate">
            {conversation.participantName}
          </h3>
          <span className="text-xs text-[#718096] ml-2 flex-shrink-0">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>

        <p
          className="text-sm text-[#333333] truncate mb-1 font-medium"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          📦 {conversation.productTitle}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#718096] truncate flex items-center gap-1">
            {conversation.lastMessage && (
              <>
                {conversation.unreadCount === 0 && <CheckCheck className="w-3 h-3 text-blue-500" />}
                {conversation.lastMessage}
              </>
            )}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
