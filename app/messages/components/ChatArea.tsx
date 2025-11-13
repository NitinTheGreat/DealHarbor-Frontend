// app/messages/components/ChatArea.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Conversation, ConversationMessage } from '@/lib/types/conversation';
import { useRouter } from 'next/navigation';
import EmptyState from './EmptyState';

interface ChatAreaProps {
  conversation: Conversation;
  messages: ConversationMessage[];
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  isTyping: boolean;
  isConnected: boolean;
  initialMessage?: string;
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  onTyping,
  isTyping,
  isConnected,
  initialMessage,
}: ChatAreaProps) {
  const [messageText, setMessageText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-fill template message for new conversations
  useEffect(() => {
    if (initialMessage && messages.length === 0 && !messageText) {
      setMessageText(initialMessage);
    }
  }, [initialMessage, messages.length, messageText]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Send typing indicator
    onTyping(true);

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      onTyping(false);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    onSendMessage(messageText.trim());
    setMessageText('');
    onTyping(false);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMessageStatus = (status: ConversationMessage['status']) => {
    switch (status) {
      case 'SENDING':
        return <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />;
      case 'SENT':
        return <Check className="w-4 h-4 text-white/70" />;
      case 'DELIVERED':
        return <CheckCheck className="w-4 h-4 text-white/70" />;
      case 'READ':
        return <CheckCheck className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {conversation.participantAvatar ? (
              <img
                src={conversation.participantAvatar}
                alt={conversation.participantName}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D97E96] to-[#E598AD] flex items-center justify-center text-white font-semibold shadow-lg">
                {getInitials(conversation.participantName)}
              </div>
            )}
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-[#2D3748] flex items-center gap-2">
              {conversation.participantName}
              {!isConnected && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                  Reconnecting...
                </span>
              )}
            </h2>
            <p className="text-sm text-[#718096]">
              {isTyping ? (
                <span className="flex items-center gap-1 text-[#D97E96]">
                  <span className="animate-pulse">typing</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                </span>
              ) : conversation.isOnline ? (
                'Active now'
              ) : (
                `Last seen ${conversation.lastSeen ? new Date(conversation.lastSeen).toLocaleString() : 'recently'}`
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/50 rounded-xl transition-all">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white/50 rounded-xl transition-all">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white/50 rounded-xl transition-all">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white/50 rounded-xl transition-all">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#D97E96]/10 to-[#E598AD]/10 backdrop-blur border-b border-white/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {conversation.productImageUrl ? (
            <img
              src={conversation.productImageUrl}
              alt={conversation.productTitle}
              className="w-16 h-16 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D97E96]/20 to-[#E598AD]/20 flex items-center justify-center text-3xl">
              📦
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[#2D3748] line-clamp-1">
              {conversation.productTitle}
            </h3>
            <p className="text-lg font-bold text-[#D97E96]">
              ₹{conversation.productPrice.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/products/${conversation.productId}`)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-xl hover:shadow-lg transition-all font-medium"
          style={{ fontFamily: 'var(--font-button)' }}
        >
          View Product
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/20">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D97E96]/20 to-[#E598AD]/20 flex items-center justify-center">
                <Send className="w-10 h-10 text-[#D97E96]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                Ready to start chatting!
              </h3>
              <p className="text-sm text-[#718096] mb-4">
                We've prepared a message template below. Feel free to edit it and hit send!
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-[#D97E96] font-medium">
                <span className="animate-pulse">↓</span>
                <span>Edit your message below</span>
                <span className="animate-pulse">↓</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.isOwn
                      ? 'bg-gradient-to-br from-[#D97E96] to-[#E598AD] text-white rounded-t-[20px] rounded-l-[20px] rounded-br-[4px] shadow-lg'
                      : 'bg-white/90 backdrop-blur text-[#333333] rounded-t-[20px] rounded-r-[20px] rounded-bl-[4px] shadow-md'
                  }`}
                >
                  <p className="px-4 py-3 text-[15px] leading-relaxed break-words">
                    {message.content}
                  </p>
                  <div
                    className={`px-4 pb-2 flex items-center justify-end gap-1 text-xs ${
                      message.isOwn ? 'text-white/80' : 'text-[#718096]'
                    }`}
                  >
                    <span>{formatMessageTime(message.timestamp)}</span>
                    {message.isOwn && renderMessageStatus(message.status)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/20 bg-white/90 backdrop-blur-lg shadow-lg">
        <div className="flex items-end gap-2">
          {/* Attachment Buttons */}
          <button className="p-2.5 hover:bg-white/80 rounded-xl transition-all flex-shrink-0 text-gray-600 hover:text-[#D97E96]">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-white/80 rounded-xl transition-all flex-shrink-0 text-gray-600 hover:text-[#D97E96]">
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              placeholder="Type a message..."
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97E96] resize-none max-h-32 transition-all"
              style={{ minHeight: '48px' }}
              disabled={!isConnected}
            />
          </div>

          {/* Emoji Button */}
          <button className="p-2.5 hover:bg-white/80 rounded-xl transition-all flex-shrink-0 text-gray-600 hover:text-[#D97E96]">
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !isConnected}
            className="p-3 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-[#718096] mt-2 ml-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
