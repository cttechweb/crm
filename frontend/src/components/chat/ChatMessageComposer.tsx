'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Paperclip,
  Sparkles,
} from 'lucide-react';

interface ChatMessageComposerProps {
  conversationTitle?: string;
  onSendMessage: (text: string) => Promise<void>;
  onSendTyping?: (isTyping: boolean) => void;
  typingUsers?: string[];
  disabled?: boolean;
}

const QUICK_EMOJIS = ['👍', '🙌', '✅', '❤️', '🔥', '🎉', '🤝', '😊'];

export function ChatMessageComposer({
  conversationTitle,
  onSendMessage,
  onSendTyping,
  typingUsers = [],
  disabled = false,
}: ChatMessageComposerProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const newHeight = Math.min(el.scrollHeight, 180);
      el.style.height = `${Math.max(newHeight, 40)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (onSendTyping) {
      onSendTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onSendTyping(false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    try {
      setIsSending(true);
      if (onSendTyping) onSendTyping(false);
      setText('');
      await onSendMessage(trimmed);
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to send message', err);
      // Restore text if failed
      setText(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 flex flex-col">
      {/* Typing indicator alert */}
      <div className="h-4 px-2 mb-1 flex items-center">
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 italic">
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping delay-100" />
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping delay-200" />
            </span>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.slice(0, 2).join(', ')} and others are typing...`}
            </span>
          </div>
        )}
      </div>

      {/* Main Composer Box */}
      <div className="relative border border-slate-300 rounded-lg bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder={`Message ${conversationTitle || 'chat'}...`}
          rows={1}
          className="w-full bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[40px] max-h-[180px]"
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between px-2 py-1.5 border-t border-slate-200/60 bg-white/70 rounded-b-lg">
          <div className="flex items-center gap-1 relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Quick Emoji Popover */}
            {showEmojiPicker && (
              <div className="absolute left-0 bottom-8 z-20 p-2 bg-white border border-slate-200 rounded-lg shadow-lg flex items-center gap-1.5">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="p-1 text-base hover:bg-slate-100 rounded transition-transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline select-none">
              Enter to send, Shift+Enter for newline
            </span>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || isSending || disabled}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

