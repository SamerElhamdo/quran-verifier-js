// examples/verify.ts
import { verifyAyah } from "../src/index.js";

const CID = "bafybeiciwnq5g7v5a7yjtdfqwrl6wmdn7jfp6gfjngvxw2ncxjytzk22im";
const ayahId = "001:001";

verifyAyah(CID, ayahId)
  .then(result => {
    console.log("✅ Verified:", result);
  })
  .catch(err => {
    console.error("❌ Error:", err.message);
  });