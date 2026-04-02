import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

// USDC Mainnet address
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Treasury wallet dari x402 health endpoint
const TREASURY_WALLET = new PublicKey('9wVfWxbWLpHwyxVVkBJkzjeabHkdfZG6zyraVoLLB7jv');

// RPC endpoint
const RPC_URL = 'https://api.mainnet-beta.solana.com';

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

export async function checkUSDCBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<USDCBalance> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletAddress
    );

    const accountInfo = await getAccount(connection, tokenAccount);
    const balance = Number(accountInfo.amount) / 1_000_000; // USDC has 6 decimals

    return {
      balance,
      hasAccount: true,
      formatted: `$${balance.toFixed(2)} USDC`,
    };
  } catch (error) {
    // Account doesn't exist
    return {
      balance: 0,
      hasAccount: false,
      formatted: '$0.00 USDC',
    };
  }
}

export async function sendUSDCPayment(
  connection: Connection,
  wallet: any,
  amountUSDC: number
): Promise<PaymentResult> {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Check balance first
    const balanceInfo = await checkUSDCBalance(connection, wallet.publicKey);
    
    if (!balanceInfo.hasAccount) {
      throw new Error('No USDC account found. Please add USDC to your wallet first.');
    }

    if (balanceInfo.balance < amountUSDC) {
      throw new Error(`Insufficient USDC. You have ${balanceInfo.formatted}, need $${amountUSDC.toFixed(2)} USDC`);
    }

    // USDC has 6 decimals
    const amountLamports = Math.floor(amountUSDC * 1_000_000);

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      wallet.publicKey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      TREASURY_WALLET
    );

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      wallet.publicKey,
      amountLamports,
      [],
      TOKEN_PROGRAM_ID
    );

    // Create transaction
    const transaction = new Transaction().add(transferInstruction);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    return {
      signature,
      success: true,
    };
  } catch (error) {
    console.error('Payment error:', error);
    return {
      signature: '',
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

export function getSolanaConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)} USDC`;
}
