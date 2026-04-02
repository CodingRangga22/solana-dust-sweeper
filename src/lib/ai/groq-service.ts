import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Karena kita pakai di browser
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are Arsweep AI, an intelligent assistant for the Arsweep dust token sweeper platform on Solana.

Your capabilities:
- Analyze Solana token addresses and identify potential scams
- Explain what dust tokens are and how to manage them safely
- Guide users through the Arsweep platform
- Provide Solana ecosystem education
- Detect suspicious token patterns

Your tone: Helpful, professional, security-conscious. Always prioritize user safety.

When analyzing tokens:
1. Look for red flags: no metadata, low liquidity, new creation date
2. Assign risk scores: 0-30 (safe), 31-70 (suspicious), 71-100 (likely scam)
3. Give clear recommendations: sweep, hold, or investigate further

Be concise but thorough. Use emojis sparingly (🔍⚠️💡✅).`;

export class GroqAIService {
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.conversationHistory.push({
      role: 'system',
      content: SYSTEM_PROMPT
    });
  }

  async chat(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Keep only last 10 messages to stay within context limits
      if (this.conversationHistory.length > 11) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-10)
        ];
      }

      const completion = await groq.chat.completions.create({
        messages: this.conversationHistory,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async analyzeToken(tokenAddress: string, metadata?: any): Promise<{
    riskScore: number;
    alertType: 'safe' | 'suspicious' | 'scam';
    reasons: string[];
    recommendation: string;
  }> {
    const prompt = `Analyze this Solana token for potential risks:

Token Address: ${tokenAddress}
Metadata: ${metadata ? JSON.stringify(metadata, null, 2) : 'No metadata available'}

Provide analysis in this exact JSON format:
{
  "riskScore": <number 0-100>,
  "alertType": "<safe|suspicious|scam>",
  "reasons": ["reason 1", "reason 2"],
  "recommendation": "clear action recommendation"
}`;

    try {
      const response = await this.chat(prompt);
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if parsing fails
      return {
        riskScore: 50,
        alertType: 'suspicious',
        reasons: ['Unable to analyze token completely'],
        recommendation: 'Exercise caution and verify token manually'
      };
    } catch (error) {
      console.error('Token analysis error:', error);
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [this.conversationHistory[0]]; // Keep only system prompt
  }

  getHistory(): ChatMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }
}

export const aiService = new GroqAIService();
