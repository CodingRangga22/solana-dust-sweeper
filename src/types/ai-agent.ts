export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface NotificationSettings {
  browserPush: boolean;
  telegram: boolean;
  alertTypes: {
    dustTokens: boolean;
    scamWarnings: boolean;
    weeklySummary: boolean;
  };
}

export interface UserSubscription {
  id: string;
  walletAddress: string;
  telegramUserId?: string;
  telegramUsername?: string;
  tier: 'free' | 'premium';
  alertTypes: {
    dust_tokens: boolean;
    scam_warnings: boolean;
    weekly_summary: boolean;
  };
  isActive: boolean;
}

export interface TokenAnalysis {
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  riskScore: number;
  alertType: 'safe' | 'suspicious' | 'scam';
  reasons: string[];
  recommendation: string;
}
