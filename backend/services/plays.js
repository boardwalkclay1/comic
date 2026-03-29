import { db } from "../db/index.js";
import { v4 as uuid } from "uuid";

export async function logInternalPlay(params) {
  await db.none(
    `INSERT INTO asset_plays (
      id, asset_id, source, source_detail,
      user_id, country, device, watch_seconds
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8
    )`,
    [
      uuid(),
      params.assetId,
      params.source,
      params.sourceDetail || null,
      params.userId || null,
      params.country || null,
      params.device || null,
      params.watchSeconds || 0
    ]
  );
}
