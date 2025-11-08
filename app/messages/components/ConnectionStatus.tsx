// app/messages/components/ConnectionStatus.tsx
'use client';

import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">Reconnecting...</span>
      </div>
    </div>
  );
}
