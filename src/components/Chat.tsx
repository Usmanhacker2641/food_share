import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Message } from '../lib/types';
import { getMessages, sendMessage, subscribeToMessages } from '../lib/chat';

interface ChatProps {
  recipientId: string;
  recipientName: string;
  pickupId: string;
}

const Chat: React.FC<ChatProps> = ({ recipientId, recipientName, pickupId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;
      const existingMessages = await getMessages(pickupId);
      setMessages(existingMessages);
    };

    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(pickupId, (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => unsubscribe();
  }, [pickupId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsLoading(true);
    try {
      const message = await sendMessage({
        pickup_id: pickupId,
        sender_id: user.id,
        sender_name: user.name,
        content: newMessage.trim(),
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-neutral-200 bg-white">
      {/* Chat Header */}
      <div className="border-b border-neutral-200 p-4">
        <h3 className="font-medium text-neutral-900">Chat with {recipientName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="mt-1 text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 