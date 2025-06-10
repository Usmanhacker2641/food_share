import { Message } from './types';

// Mock messages storage
const mockMessages: Message[] = [];

export const getMessages = async (pickupId: string): Promise<Message[]> => {
  // In a real app, this would fetch messages from your backend
  return mockMessages.filter(m => m.pickup_id === pickupId);
};

export const sendMessage = async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  // In a real app, this would send the message to your backend
  const newMessage: Message = {
    ...message,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
  };

  mockMessages.push(newMessage);
  return newMessage;
};

export const subscribeToMessages = (
  pickupId: string,
  callback: (message: Message) => void
): () => void => {
  // In a real app, this would set up a WebSocket or SSE connection
  const interval = setInterval(() => {
    const messages = mockMessages.filter(m => m.pickup_id === pickupId);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      callback(lastMessage);
    }
  }, 1000);

  return () => clearInterval(interval);
}; 