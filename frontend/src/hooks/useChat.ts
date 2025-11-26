import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  topic: string;
  message: string;
  created_at: string;
}

export const useChat = (topic = 'general') => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  // Load messages function
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chat/messages?topic=${topic}&limit=50`);
      setMessages(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load chat history. Please refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!user || !token) {
      console.error('User not authenticated');
      return () => {}; // Return empty cleanup function
    }

    // Close existing connection if any
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    // Create new WebSocket connection
    // Use wss:// in production, ws:// in development
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    const wsUrl = `${protocol}${host}/api/chat/ws?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      setError(null);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'new_message') {
          setMessages(prev => [data.data, ...prev].slice(0, 200)); // Keep last 200 messages
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect only if component is still mounted
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
        const timeoutId = setTimeout(connectWebSocket, reconnectInterval);
        return () => clearTimeout(timeoutId);
      } else {
        setError('Disconnected from chat. Please refresh the page to reconnect.');
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Trying to reconnect...');
    };

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user, token]);

  // Send message function
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !isConnected || !ws.current) return false;

    try {
      const messageData = {
        topic,
        message: message.trim().slice(0, 500) // Limit message length
      };

      // Try WebSocket first
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
        return true;
      } 
      // Fallback to REST API if WebSocket is not available
      else {
        await api.post('/chat/send', messageData);
        return true;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      return false;
    }
  }, [isConnected, topic]);

  // Connect on mount and when user/token changes
  useEffect(() => {
    if (user && token) {
      // Load messages first, then connect to WebSocket
      const loadData = async () => {
        await loadMessages();
        connectWebSocket();
      };
      loadData();
    }
    
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user, token, connectWebSocket, loadMessages]);

  return {
    messages: [...messages].reverse(), // Reverse to show newest at bottom
    isConnected,
    isLoading,
    error,
    sendMessage,
    reconnect: connectWebSocket
  };
};
