import { useState } from 'react';
import { arsweepApi, ChatRequest } from '../services/arsweepApi';

export interface WalletScanResult {
  address: string;
  solBalance: number;
  solValue: number;
  tokens: any[];
  totalValue: number;
  tokenCount: number;
  nftCount: number;
}

export type PremiumServiceType = 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';

export interface ChatMessageModel {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  walletScan?: WalletScanResult;
  toolsUsed?: string[];
  /** Structured premium payload for rich UI (charts, cards). */
  premiumResult?: { serviceType: PremiumServiceType; payload: unknown };
}

export const useArsweepChat = (userId: string) => {
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string, walletAddress?: string) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessageModel = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const request: ChatRequest = { userId, message, walletAddress };
      const response = await arsweepApi.chat(request);

      const aiMessage: ChatMessageModel = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        toolsUsed: response.toolsUsed?.length ? response.toolsUsed : undefined,
      };
      setMessages(prev => [...prev, aiMessage]);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const updateMessage = (id: string, updates: Partial<ChatMessageModel>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  };
  return { messages, isLoading, error, sendMessage, clearChat, updateMessage, setMessages };
};
