'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ChatClientPage = dynamic(
  () => import('@/components/chat/ChatClientPage').then((mod) => mod.ChatClientPage),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-140px)] min-h-[500px] w-full rounded-xl bg-white border border-slate-200 p-8 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-xs font-semibold">Loading CoolTech Chat...</span>
      </div>
    ),
  }
);

export default function ChatPage() {
  return <ChatClientPage />;
}
