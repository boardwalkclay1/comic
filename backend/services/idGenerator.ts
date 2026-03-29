import { getNextSequence } from "../db/sequences"; // implement per DB

export async function generateAssetCode(type: "video_full" | "video_short" | "audio") {
  const config = {
    video_full: { prefix: "VCF_", padding: 5 },
    video_short: { prefix: "VCS_", padding: 5 },
    audio: { prefix: "AUD_", padding: 5 }
  }[type];

  const seq = await getNextSequence(type); // e.g. 1, 2, 3...
  const padded = String(seq).padStart(config.padding, "0");
  return `${config.prefix}${padded}`;
}
