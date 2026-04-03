import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

const API_BASE = 'https://api.arsweep.fun/v1';

interface PaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

interface USDCBalance {
  balance: number;
  hasAccount: boolean;
  formatted: string;
}

// Fetch treasury info dari backend — tidak ada hardcoded address di frontend
async function getPaymentInfo() {
  const res = await fetch(`${API_BASE}/payment/info`);
  if (!res.ok) throw new Error('Failed to fetch payment info');
  return res.json() as Promise<{ treasury: string; usdcMint: string; network: string }>;
}

export async function checkUSDCBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<USDCBalance> {
  try {
    const { usdcMint } = await getPaymentInfo();
    const USDC_MINT = new PublicKey(usdcMint);
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, walletAddress);
    const accountInfo = await getAccount(connection, tokenAccount);
    const balance = Number(accountInfo.amount) / 1_000_000;
    return { balance, hasAccount: true, formatted: `$${balance.toFixed(2)} USDC` };
  } catch {
    return { balance: 0, hasAccount: false, formatted: '$0.00 USDC' };
  }
}

export async function sendUSDCPayment(
  connection: Connection,
  wallet: any,
  amountUSDC: number
): Promise<PaymentResult> {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');

    const { treasury, usdcMint } = await getPaymentInfo();
    const USDC_MINT = new PublicKey(usdcMint);
    const TREASURY = new PublicKey(treasury);

    const balanceInfo = await checkUSDCBalance(connection, wallet.publicKey);
    if (!balanceInfo.hasAccount) throw new Error('No USDC account found.');
    if (balanceInfo.balance < amountUSDC) throw new Error(`Insufficient USDC. Have ${balanceInfo.formatted}, need $${amountUSDC.toFixed(2)}`);

    const amountAtomic = Math.floor(amountUSDC * 1_000_000);
    const fromATA = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
    const toATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY);

    const tx = new Transaction().add(
      createTransferInstruction(fromATA, toATA, wallet.publicKey, amountAtomic, [], TOKEN_PROGRAM_ID)
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    // Sign di client
    const signed = await wallet.signTransaction(tx);
    const signedBase64 = Buffer.from(signed.serialize()).toString('base64');

    // Send via backend — tidak expose treasury di frontend
    const res = await fetch(`${API_BASE}/payment/usdc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromWallet: wallet.publicKey.toString(),
        amountUSDC,
        signedTx: signedBase64,
      }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Payment failed');

    return { signature: data.signature, success: true };
  } catch (error) {
    return { signature: '', success: false, error: error instanceof Error ? error.message : 'Payment failed' };
  }
}

export function getSolanaConnection(): Connection {
  return new Connection(import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
}

export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)} USDC`;
}
