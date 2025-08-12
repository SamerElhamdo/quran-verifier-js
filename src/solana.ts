import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, DEFAULT_RPC } from "./constants.js";

export async function getOnchainRoot(
  editionPda: string,
  rpcUrl: string = DEFAULT_RPC
): Promise<string> {
  const connection = new Connection(rpcUrl, "confirmed");
  const pubkey = new PublicKey(editionPda);

  const accountInfo = await connection.getAccountInfo(pubkey);
  if (!accountInfo) throw new Error("Edition account not found on-chain");

  // ⚠️ يجب تعديل الإزاحات offsets حسب struct في العقد
  const offset =
    32 + // authority
    4 + 16 + // edition_tag
    4 + 16;  // version
  const rootBytes = accountInfo.data.subarray(offset, offset + 32);

  return Buffer.from(rootBytes).toString("hex");
}

export function verifyAgainstOnchain(fileRoot: string, onchainRoot: string) {
  return fileRoot.toLowerCase() === onchainRoot.toLowerCase();
}