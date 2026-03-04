import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import idl from "../idl/arsweep.json";
import { RPC_ENDPOINT } from "../config/env";

// ✅ Program ID mainnet (dari deployment resmi)
export const PROGRAM_ID = new PublicKey(
  "4cS4fZH6DoFown46UiF2EtG412PVd5BSi8m4tmefAq9o"
);

// ✅ Treasury wallet
export const TREASURY = new PublicKey(
  "J7ApX8Y3vp6WcsGD99kyTTQyLuxxhsT8zBfNTqcFW9qi"
);

// ✅ Pakai RPC dari env (devnet/mainnet otomatis)
export const connection = new Connection(RPC_ENDPOINT, "confirmed");

export const getProgram = (wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return new Program(idl as Idl, PROGRAM_ID, provider);
};
