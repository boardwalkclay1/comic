import { db } from "../db";

export async function logInternalPlay(params: {
  assetId: string;
  source: "app" | "web" | "embed";
  sourceDetail?: string;
  userId?: string;
  country?: string;
  device?: string;
  watchSeconds?: number;
}) {
  await db.insertInto("asset_plays").values({
    id: db.uuid(),
    asset_id: params.assetId,
    source: params.source,
    source_detail: params.sourceDetail ?? null,
    user_id: params.userId ?? null,
    country: params.country ?? null,
    device: params.device ?? null,
    watch_seconds: params.watchSeconds ?? 0
  });
}
