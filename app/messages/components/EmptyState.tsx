// app/messages/components/EmptyState.tsx
'use client';

interface EmptyStateProps {
  type: 'no-conversations' | 'no-messages' | 'select-conversation';
  searchQuery?: string;
}

export default function EmptyState({ type, searchQuery }: EmptyStateProps) {
  const content = {
    'no-conversations': {
      icon: '💬',
      title: 'No conversations yet',
      description: searchQuery
        ? 'No conversations match your search'
        : 'Start chatting with sellers by clicking "Chat with Seller" on any product!',
    },
    'no-messages': {
      icon: '�',
      title: 'No messages yet',
      description: 'Start the conversation by sending a message below.',
    },
    'select-conversation': {
      icon: '�',
      title: 'Select a conversation',
      description: 'Choose a conversation from the left to start chatting',
    },
  };

  const { icon, title, description } = content[type];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3
        className="text-xl font-semibold text-[#2D3748] mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      <p className="text-[#718096] max-w-md text-sm">{description}</p>
    </div>
  );
}
