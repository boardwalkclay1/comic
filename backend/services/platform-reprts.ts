import { db } from "../db";

export async function savePlatformRevenueReport(params: {
  assetId: string;
  platform: string;
  periodStart: string; // 'YYYY-MM-DD'
  periodEnd: string;
  totalPlays: number;
  totalRevenueUsd: number;
  rawPayload?: any;
}) {
  await db.insertInto("platform_revenue_reports").values({
    id: db.uuid(),
    asset_id: params.assetId,
    platform: params.platform,
    period_start: params.periodStart,
    period_end: params.periodEnd,
    total_plays: params.totalPlays,
    total_revenue_usd: params.totalRevenueUsd,
    raw_payload: params.rawPayload ?? null
  });
}
