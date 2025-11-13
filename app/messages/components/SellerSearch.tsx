// app/messages/components/SellerSearch.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Search, X, Loader2 } from 'lucide-react';

interface SellerSearchResult {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  isVerified: boolean;
  productCount: number;
  averageRating?: number;
  hasExistingConversation: boolean;
  existingConversationId?: string;
}

interface SellerSearchProps {
  onSelectSeller: (sellerId: string, hasExisting: boolean, existingConvId?: string) => void;
  onClose: () => void;
}

export default function SellerSearch({ onSelectSeller, onClose }: SellerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SellerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function (500ms delay)
  const searchSellers = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('[SellerSearch] Searching for:', searchQuery);
        const response = await fetch(
          `/api/messages/sellers/search?query=${encodeURIComponent(searchQuery)}&page=0&size=10`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error('Failed to search sellers');
        }

        const data = await response.json();
        console.log('[SellerSearch] Results:', data);
        
        // Handle paginated response
        const sellers = data.content || data || [];
        setResults(sellers);
      } catch (err) {
        console.error('[SellerSearch] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to search sellers');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (query.trim().length >= 2) {
      setLoading(true);
      searchSellers(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, searchSellers]);

  const getFullName = (seller: SellerSearchResult) => {
    return `${seller.firstName} ${seller.lastName}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2
            className="text-2xl font-bold text-[#2D3748]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Start New Chat
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sellers by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97E96] transition-all placeholder:text-gray-400"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#D97E96] mb-3" />
              <p className="text-gray-500">Searching sellers...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => setQuery(query)}
                className="text-sm text-[#D97E96] hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No sellers found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {!loading && !error && query.length < 2 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500 text-lg">Search for sellers</p>
              <p className="text-gray-400 text-sm mt-1">
                Start typing to find sellers you want to chat with
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-2">
              {results.map((seller) => (
                <button
                  key={seller.userId}
                  onClick={() => onSelectSeller(
                    seller.userId,
                    seller.hasExistingConversation,
                    seller.existingConversationId
                  )}
                  className="w-full p-4 bg-white hover:bg-gradient-to-r hover:from-[#D97E96]/5 hover:to-[#E598AD]/5 rounded-xl border border-gray-200 hover:border-[#D97E96] transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      {seller.profileImageUrl ? (
                        <img
                          src={seller.profileImageUrl}
                          alt={getFullName(seller)}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D97E96] to-[#E598AD] flex items-center justify-center text-white font-semibold text-xl">
                          {seller.firstName.charAt(0)}{seller.lastName.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Seller Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#2D3748] text-lg group-hover:text-[#D97E96] transition-colors">
                          {getFullName(seller)}
                        </span>
                        {seller.isVerified && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mb-2">{seller.email}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📦 {seller.productCount} products</span>
                        {seller.averageRating && seller.averageRating > 0 && (
                          <span>⭐ {seller.averageRating.toFixed(1)}</span>
                        )}
                      </div>

                      {seller.hasExistingConversation && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <span>💬</span>
                          <span>Existing conversation</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
