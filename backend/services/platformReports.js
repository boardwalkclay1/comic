import { db } from "../db/index.js";
import { v4 as uuid } from "uuid";

export async function savePlatformRevenueReport(params) {
  await db.none(
    `INSERT INTO platform_revenue_reports (
      id, asset_id, platform, period_start, period_end,
      total_plays, total_revenue_usd, raw_payload
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8
    )`,
    [
      uuid(),
      params.assetId,
      params.platform,
      params.periodStart,
      params.periodEnd,
      params.totalPlays,
      params.totalRevenueUsd,
      params.rawPayload || null
    ]
  );
}
