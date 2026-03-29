import { db } from "../db/index.js";
import { generateAssetCode } from "./idGenerator.js";
import { v4 as uuid } from "uuid";

export async function createAsset(params) {
  const internalCode = await generateAssetCode(params.type);

  const asset = await db.one(
    `INSERT INTO assets (
      id, creator_id, agreement_id, type, internal_code,
      title, description, duration_seconds, storage_path, file_hash
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    ) RETURNING *`,
    [
      uuid(),
      params.creatorId,
      params.agreementId || null,
      params.type,
      internalCode,
      params.title,
      params.description || null,
      params.durationSeconds || null,
      params.storagePath,
      params.fileHash || null
    ]
  );

  return asset;
}

export async function registerAssetOnPlatform(params) {
  const row = await db.one(
    `INSERT INTO asset_platform_registrations (
      id, asset_id, platform, platform_asset_id, url,
      monetization_enabled, content_id_enabled
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7
    ) RETURNING *`,
    [
      uuid(),
      params.assetId,
      params.platform,
      params.platformAssetId,
      params.url,
      params.monetizationEnabled !== false,
      params.contentIdEnabled === true
    ]
  );

  return row;
}
