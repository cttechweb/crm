'use client';

import React, { useEffect } from 'react';
import { RefreshCw, MessageSquare } from 'lucide-react';

export default function ChatErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.warn('CoolTech Chat encountered a recoverable navigation error:', error);
  }, [error]);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] w-full rounded-xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
        <MessageSquare className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">CoolTech Chat</h3>
      <p className="text-xs text-slate-500 max-w-md mb-4">
        Unable to load the chat session or connection was interrupted. Click retry to reconnect instantly.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Connection</span>
      </button>
    </div>
  );
}

