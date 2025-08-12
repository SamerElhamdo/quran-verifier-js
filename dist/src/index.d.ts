export type AyahRec = {
    text: string;
    hash: string;
    index: number;
    proof: string[];
};
export type QuranData = {
    meta: {
        edition: string;
        version: string;
    };
    merkle_root: string;
    ayahs: Record<string, AyahRec>;
};
/**
 * تحميل ملف القرآن من IPFS
 */
export declare function loadQuranData(cid: string, filename: string): Promise<QuranData>;
/**
 * التحقق من آية عبر ID (مثال: "001:001")
 */
export declare function verifyAyah(cid: string, ayahId: string, filename?: string): Promise<{
    ayahId: string;
    edition: string;
    version: string;
    merkleRoot: string;
    verified: boolean;
}>;
