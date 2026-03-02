import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import idl from "../idl/arsweep.json";

export const getProgram = (wallet: any) => {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );

  anchor.setProvider(provider);

  return new anchor.Program(idl as anchor.Idl, provider);
};