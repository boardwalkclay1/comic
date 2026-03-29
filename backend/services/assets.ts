import { db } from "../db";
import { generateAssetCode } from "./idGenerator";

export async function createAsset(params: {
  creatorId: string;
  agreementId: string | null;
  type: "video_full" | "video_short" | "audio";
  title: string;
  description?: string;
  durationSeconds?: number;
  storagePath: string;
  fileHash?: string;
}) {
  const internalCode = await generateAssetCode(params.type);

  const asset = await db.insertInto("assets").values({
    id: db.uuid(),
    creator_id: params.creatorId,
    agreement_id: params.agreementId,
    type: params.type,
    internal_code: internalCode,
    title: params.title,
    description: params.description ?? null,
    duration_seconds: params.durationSeconds ?? null,
    storage_path: params.storagePath,
    file_hash: params.fileHash ?? null
  }).returningAll();

  return asset;
}

export async function registerAssetOnPlatform(params: {
  assetId: string;
  platform: "youtube" | "tiktok" | "instagram" | "spotify";
  platformAssetId: string;
  url: string;
  monetizationEnabled?: boolean;
  contentIdEnabled?: boolean;
}) {
  const row = await db.insertInto("asset_platform_registrations").values({
    id: db.uuid(),
    asset_id: params.assetId,
    platform: params.platform,
    platform_asset_id: params.platformAssetId,
    url: params.url,
    monetization_enabled: params.monetizationEnabled ?? true,
    content_id_enabled: params.contentIdEnabled ?? false
  }).returningAll();

  return row;
}
