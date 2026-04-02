const API_BASE_URL = "https://api.arsweep.fun/v1";

export interface ChatRequest {
  userId: string;
  message: string;
  walletAddress?: string;
}

export interface ChatResponse {
  text: string;
  toolsUsed: string[];
}

export const arsweepApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
