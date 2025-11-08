// app/messages/components/ConversationList.tsx
'use client';

import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Conversation } from '@/lib/types/conversation';
import ConversationItem from './ConversationItem';
import EmptyState from './EmptyState';
import { useRouter } from 'next/navigation';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onlineUsers: Set<string>;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onlineUsers,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [sellers, setSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const router = useRouter();

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSellers = async (query: string) => {
    setSellerSearchQuery(query);
    if (query.length < 2) {
      setSellers([]);
      return;
    }

    setLoadingSellers(true);
    try {
      console.log('Searching sellers with query:', query);
      const response = await fetch(
        `/api/users/search?query=${encodeURIComponent(query)}&role=SELLER`,
        { credentials: 'include' }
      );
      
      console.log('Seller search response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Seller search results:', data);
        setSellers(data.content || data);
      } else {
        console.error('Seller search failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error searching sellers:', error);
    } finally {
      setLoadingSellers(false);
    }
  };

  const handleSelectSeller = (seller: any) => {
    setShowNewChatModal(false);
    setSellerSearchQuery('');
    setSellers([]);
    router.push(`/messages?sellerId=${seller.id}`);
  };

  return (
    <div className="w-full md:w-96 bg-white/90 backdrop-blur-lg border-r border-white/20 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-[#D97E96]/10 to-[#E598AD]/10">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-3xl font-bold text-[#2D3748]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Messages
          </h1>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 bg-gradient-to-r from-[#D97E96] to-[#E598AD] text-white rounded-xl hover:shadow-lg transition-all"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97E96] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <EmptyState type="no-conversations" searchQuery={searchQuery} />
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              isOnline={onlineUsers.has(conversation.participantId)}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[600px] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2
                className="text-2xl font-bold text-[#2D3748]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Start New Chat
              </h2>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setSellerSearchQuery('');
                  setSellers([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sellers by name or email..."
                  value={sellerSearchQuery}
                  onChange={(e) => handleSearchSellers(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97E96] transition-all placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Sellers List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingSellers ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin w-6 h-6 border-2 border-[#D97E96] border-t-transparent rounded-full mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : sellers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {sellerSearchQuery.length >= 2
                    ? 'No sellers found'
                    : 'Type at least 2 characters to search'}
                </div>
              ) : (
                <div className="space-y-2">
                  {sellers.map((seller) => (
                    <button
                      key={seller.id}
                      onClick={() => handleSelectSeller(seller)}
                      className="w-full p-4 bg-white hover:bg-gradient-to-r hover:from-[#D97E96]/10 hover:to-[#E598AD]/10 rounded-xl border border-gray-200 hover:border-[#D97E96] transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D97E96] to-[#E598AD] flex items-center justify-center text-white font-semibold">
                          {seller.firstName?.[0]}{seller.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2D3748]">
                            {seller.firstName} {seller.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{seller.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
