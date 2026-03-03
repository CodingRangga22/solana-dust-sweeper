import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import { homedir } from "os";

const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
const keypair = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(homedir() + "/.config/solana/id.json", "utf-8")))
);
const wallet = new anchor.Wallet(keypair);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);

const idl = JSON.parse(readFileSync("./src/idl/arsweep.json", "utf-8"));
const program = new anchor.Program(idl, provider);
const TREASURY = new PublicKey("J7ApX8Y3vp6WcsGD99kyTTQyLuxxhsT8zBfNTqcFW9qi");

// List semua token accounts
const accounts = await connection.getParsedTokenAccountsByOwner(
  keypair.publicKey,
  { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
);

console.log("Token accounts found:", accounts.value.length);

for (const { pubkey, account } of accounts.value) {
  const amount = BigInt(account.data.parsed.info.tokenAmount.amount);
  console.log(`\nAccount: ${pubkey.toBase58()}`);
  console.log(`Amount: ${amount}`);
  
  if (amount === BigInt(0)) {
    console.log("→ Sweeping...");
    try {
      const tx = await program.methods
        .closeEmptyAccount()
        .accounts({
          user: keypair.publicKey,
          tokenAccount: pubkey,
          treasury: TREASURY,
        })
        .rpc();
      console.log("✅ Swept! Tx:", tx);
      console.log("Explorer: https://solscan.io/tx/" + tx + "?cluster=devnet");
    } catch (err) {
      console.error("❌ Error:", err.message);
      if (err.logs) console.error("Logs:", err.logs);
    }
  }
}
