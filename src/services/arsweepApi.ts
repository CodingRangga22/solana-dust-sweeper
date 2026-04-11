import { getAccessToken } from "@privy-io/react-auth";

const API_BASE_URL = "https://api.arsweep.fun/v1";

// ─── Auth Helper ─────────────────────────────────────────────────────────
async function authHeaders(): Promise<Record<string, string>> {
  try {
    const token = await getAccessToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {
    // unauthenticated — lanjut tanpa token
  }
  return {};
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface ChatRequest {
  userId: string;
  message: string;
  walletAddress?: string;
}

export interface ChatResponse {
  text: string;
  toolsUsed: string[];
  platform?: string;
  userId?: string;
}

export interface HistoryMessageRow {
  role: "user" | "assistant";
  content: string;
}

export interface X402AnalyzeRequest {
  walletAddress: string;
}

export interface X402ReportRequest {
  walletAddress: string;
}

export interface X402HealthResponse {
  status: string;
  service: string;
  version: string;
  endpoints: Array<{
    path: string;
    price: string;
    description: string;
  }>;
  treasury: string;
  network: string;
  paymentProtocol: string;
}

// ─── API Client ──────────────────────────────────────────────────────────
export const arsweepApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE_URL}/agent/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Chat failed");
    }
    return res.json();
  },

  fetchHistory: async (userId: string): Promise<{ messages: HistoryMessageRow[] }> => {
    const res = await fetch(
      `${API_BASE_URL}/agent/history/${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({}),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || "History failed");
    }
    return res.json();
  },

  x402Health: async (): Promise<X402HealthResponse> => {
    const res = await fetch(`${API_BASE_URL}/x402/health`, {
      headers: await authHeaders(),
    });
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  x402Analyze: async (data: X402AnalyzeRequest) => {
    const res = await fetch(`${API_BASE_URL}/premium/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Analysis failed");
    }
    return res.json();
  },

  x402Report: async (data: X402ReportRequest) => {
    const res = await fetch(`${API_BASE_URL}/premium/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Report failed");
    }
    return res.json();
  },
};
