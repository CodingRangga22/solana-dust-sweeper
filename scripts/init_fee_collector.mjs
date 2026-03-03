import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import { homedir } from "os";

const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
const keyPath = homedir() + "/.config/solana/id.json";
const keypair = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(keyPath, "utf-8")))
);
const wallet = new anchor.Wallet(keypair);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);

const programId = new PublicKey("4cS4fZH6DoFown46UiF2EtG412PVd5BSi8m4tmefAq9o");
const idl = JSON.parse(readFileSync("../target/idl/arsweep.json", "utf-8"));
const program = new anchor.Program(idl, provider);

const [feeCollectorPda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("fee_collector")],
  programId
);

console.log("PDA   :", feeCollectorPda.toBase58());
console.log("bump  :", bump);
console.log("Payer :", wallet.publicKey.toBase58());

try {
  const tx = await program.methods
    .initializeFeeCollector()
    .accounts({
      payer: wallet.publicKey,
      feeCollector: feeCollectorPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ fee_collector initialized!");
  console.log("Tx      :", tx);
  console.log("Explorer: https://solscan.io/tx/" + tx + "?cluster=devnet");
} catch (err) {
  if (err.message?.includes("already in use")) {
    console.log("ℹ️  Already initialized — OK!");
  } else {
    console.error("❌", err.message);
  }
}
