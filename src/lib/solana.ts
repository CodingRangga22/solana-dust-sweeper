import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import idl from "../idl/arsweep.json";

export const PROGRAM_ID = new PublicKey(
  "5mwPJnU6dK24gwSMh1Dwh5LgwuM6CkwRTYL4oXi5yyuS"
);

export const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

export const getProgram = (wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return new Program(idl as Idl, PROGRAM_ID, provider);
};