import idsConfig from "../config/ids.json" assert { type: "json" };
import { db } from "../db/index.js"; // your db wrapper

// simple sequence table: sequences(name TEXT PRIMARY KEY, value BIGINT)
export async function getNextSequence(name) {
  const existing = await db.oneOrNone(
    "SELECT value FROM sequences WHERE name = $1",
    [name]
  );

  if (!existing) {
    await db.none(
      "INSERT INTO sequences (name, value) VALUES ($1, $2)",
      [name, 1]
    );
    return 1;
  }

  const next = Number(existing.value) + 1;
  await db.none(
    "UPDATE sequences SET value = $2 WHERE name = $1",
    [name, next]
  );
  return next;
}

export async function generateAssetCode(type) {
  let prefix;
  const padding = idsConfig.padding || 5;

  if (type === "video_full") prefix = idsConfig.video_full_prefix;
  else if (type === "video_short") prefix = idsConfig.video_short_prefix;
  else if (type === "audio") prefix = idsConfig.audio_prefix;
  else throw new Error("Unknown asset type: " + type);

  const seq = await getNextSequence(type);
  const padded = String(seq).padStart(padding, "0");
  return prefix + padded;
}
