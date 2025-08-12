// src/index.ts
import fetch from "node-fetch";
import { sha256 } from "@noble/hashes/sha256";
import { utf8ToBytes } from "@noble/hashes/utils";

export type AyahRec = {
  text: string;
  hash: string;
  index: number;
  proof: string[];
};

export type QuranData = {
  meta: { edition: string; version: string };
  merkle_root: string;
  ayahs: Record<string, AyahRec>;
};

/**
 * تحميل ملف القرآن من IPFS
 */
export async function loadQuranData(cid: string, filename: string): Promise<QuranData> {
  const url = `https://${cid}.ipfs.w3s.link/${filename}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json() as QuranData;
}

/**
 * تحويل Uint8Array إلى hex
 */
function hex(b: Uint8Array) {
  return [...b].map(x => x.toString(16).padStart(2, "0")).join("");
}

/**
 * تحويل hex إلى Uint8Array
 */
function hexToBytes(h: string) {
  if (h.startsWith("0x")) h = h.slice(2);
  const u = new Uint8Array(h.length / 2);
  for (let i = 0; i < u.length; i++) {
    u[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return u;
}

/**
 * مقارنة ArrayBuffers
 */
function cmp(a: Uint8Array, b: Uint8Array) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

/**
 * التحقق من آية عبر ID (مثال: "001:001")
 */
export async function verifyAyah(cid: string, ayahId: string, filename = "quran-uthmani-v2025-08-12.json") {
  const data = await loadQuranData(cid, filename);

  const rec = data.ayahs[ayahId];
  if (!rec) throw new Error(`Ayah ${ayahId} not found`);

  const [sura, ayah] = ayahId.split(":");
  const leafInput = `${data.meta.edition}|${data.meta.version}|${sura}|${ayah}|${rec.text}`;
  const leaf = new Uint8Array(sha256(utf8ToBytes(leafInput)));
  const leafHex = hex(leaf);

  if (leafHex !== rec.hash.toLowerCase()) {
    throw new Error(`Leaf hash mismatch: computed=${leafHex} stored=${rec.hash}`);
  }

  // Merkle proof verification
  let cur = leaf;
  for (const sibHex of rec.proof) {
    const sib = hexToBytes(sibHex);
    const aFirst = cmp(cur, sib) <= 0;
    const cat = aFirst
      ? new Uint8Array([...cur, ...sib])
      : new Uint8Array([...sib, ...cur]);
    cur = new Uint8Array(sha256(cat));
  }

  const computedRoot = hex(cur);
  if (computedRoot !== data.merkle_root.toLowerCase()) {
    throw new Error(`Proof mismatch: computed=${computedRoot} file=${data.merkle_root}`);
  }

  return {
    ayahId,
    edition: data.meta.edition,
    version: data.meta.version,
    merkleRoot: data.merkle_root,
    verified: true
  };
}