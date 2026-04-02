import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
  price?: number;
  value?: number;
}

export interface WalletScanResult {
  address: string;
  solBalance: number;
  solValue: number;
  tokens: TokenBalance[];
  totalValue: number;
  tokenCount: number;
  nftCount: number;
}

export class WalletScanner {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }

  // Detect wallet address dari text
  static detectWalletAddress(text: string): string | null {
    const walletPattern = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
    const matches = text.match(walletPattern);
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        try {
          new PublicKey(match);
          return match;
        } catch {
          continue;
        }
      }
    }
    return null;
  }

  // FREE: Basic wallet scan
  async scanWallet(address: string): Promise<WalletScanResult> {
    try {
      const publicKey = new PublicKey(address);

      // 1. Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      const solBalanceSOL = solBalance / LAMPORTS_PER_SOL;

      // 2. Get all token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // 3. Process tokens
      const tokens: TokenBalance[] = [];
      let nftCount = 0;

      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = parsedInfo.tokenAmount.amount;
        const decimals = parsedInfo.tokenAmount.decimals;
        const uiAmount = parsedInfo.tokenAmount.uiAmount;

        if (uiAmount === 0) continue;

        if (decimals === 0 && amount === '1') {
          nftCount++;
          continue;
        }

        tokens.push({ mint, amount, decimals, uiAmount });
      }

      // 4. Get token metadata & prices
      await this.enrichTokenData(tokens);

      // 5. Get SOL price
      const solPrice = await this.getSolPrice();
      const solValue = solBalanceSOL * solPrice;

      // 6. Calculate total value
      const tokensValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0);
      const totalValue = solValue + tokensValue;

      return {
        address,
        solBalance: solBalanceSOL,
        solValue,
        tokens: tokens.sort((a, b) => (b.value || 0) - (a.value || 0)),
        totalValue,
        tokenCount: tokens.length,
        nftCount,
      };
    } catch (error) {
      console.error('Wallet scan error:', error);
      throw new Error('Failed to scan wallet');
    }
  }

  private async enrichTokenData(tokens: TokenBalance[]): Promise<void> {
    if (tokens.length === 0) return;

    try {
      const mints = tokens.map(t => t.mint).join(',');
      const priceResponse = await axios.get(
        `https://price.jup.ag/v4/price?ids=${mints}`
      );
      const prices = priceResponse.data.data;

      const metadataResponse = await axios.get('https://token.jup.ag/all');
      const tokenList = metadataResponse.data;

      for (const token of tokens) {
        if (prices[token.mint]) {
          token.price = prices[token.mint].price;
          token.value = token.uiAmount * token.price;
        }

        const metadata = tokenList.find((t: any) => t.address === token.mint);
        if (metadata) {
          token.symbol = metadata.symbol;
          token.name = metadata.name;
          token.logoURI = metadata.logoURI;
        }
      }
    } catch (error) {
      console.error('Failed to enrich token data:', error);
    }
  }

  private async getSolPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112'
      );
      return response.data.data['So11111111111111111111111111111111111111112']?.price || 0;
    } catch {
      return 0;
    }
  }
}
