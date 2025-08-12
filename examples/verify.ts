import {
  fetchQuranFromCID,
  verifyAyah,
  getOnchainRoot,
  verifyAgainstOnchain,
  PROGRAM_ID
} from "../src/index.js";

const CID = "bafybeiciwnq5g7v5a7yjtdfqwrl6wmdn7jfp6gfjngvxw2ncxjytzk22im";
const FILENAME = "quran-uthmani-v2025-08-12.json";
const AYAH_ID = "001:001";
const EDITION_PDA = "fK3Ag4xe5QB1nEs62QRVbhw3MNz97PRkb56cB6cSZbb"; // مثال

(async () => {
  // 1️⃣ جلب البيانات من IPFS
  const data = await fetchQuranFromCID(CID, FILENAME);

  // 2️⃣ التحقق من الآية داخل الملف
  const fileVerified = verifyAyah(data, AYAH_ID);
  console.log("File verification:", fileVerified);

  // 3️⃣ جلب الجذر من سلسلة سولانا
  const onchainRoot = await getOnchainRoot(EDITION_PDA);
  console.log("On-chain root:", onchainRoot);

  // 4️⃣ المقارنة بين ملف IPFS وسولانا
  const match = verifyAgainstOnchain(data.merkle_root, onchainRoot);
  console.log("Match file root with on-chain root:", match);
})();