import { db } from "../db";

export async function calculateRoyaltiesForPeriod(params: {
  periodStart: string; // 'YYYY-MM-DD'
  periodEnd: string;
}) {
  // 1) Internal plays -> internal revenue (you define rate per play)
  const ratePerPlayUsd = 0.01;

  const internalRows = await db.raw(`
    SELECT a.id AS asset_id,
           COUNT(p.id) AS total_plays
    FROM assets a
    JOIN asset_plays p ON p.asset_id = a.id
    WHERE p.created_at::date BETWEEN $1 AND $2
    GROUP BY a.id
  `, [params.periodStart, params.periodEnd]);

  for (const row of internalRows) {
    const assetId = row.asset_id;
    const totalPlays = Number(row.total_plays);
    const gross = totalPlays * ratePerPlayUsd;

    const agreement = await db.selectFrom("distribution_agreements")
      .where("id", "=", db.ref("assets.agreement_id"))
      .join("assets", "assets.creator_id", "distribution_agreements.creator_id")
      .where("assets.id", "=", assetId)
      .selectAll()
      .executeTakeFirst();

    const creatorSplit = agreement ? Number(agreement.royalty_split_creator) / 100 : 1.0;
    const platformSplit = agreement ? Number(agreement.royalty_split_platform) / 100 : 0.0;

    const creatorShare = gross * creatorSplit;
    const platformShare = gross * platformSplit;

    await db.insertInto("royalty_ledger").values({
      id: db.uuid(),
      asset_id: assetId,
      period_start: params.periodStart,
      period_end: params.periodEnd,
      source: "internal",
      total_plays: totalPlays,
      gross_revenue_usd: gross,
      creator_share_usd: creatorShare,
      platform_share_usd: platformShare
    });
  }

  // 2) External platform reports -> royalties
  const platformRows = await db.raw(`
    SELECT asset_id, platform,
           SUM(total_plays) AS total_plays,
           SUM(total_revenue_usd) AS total_revenue_usd
    FROM platform_revenue_reports
    WHERE period_start >= $1 AND period_end <= $2
    GROUP BY asset_id, platform
  `, [params.periodStart, params.periodEnd]);

  for (const row of platformRows) {
    const assetId = row.asset_id;
    const totalPlays = Number(row.total_plays);
    const gross = Number(row.total_revenue_usd);

    const agreement = await db.selectFrom("distribution_agreements")
      .where("id", "=", db.ref("assets.agreement_id"))
      .join("assets", "assets.creator_id", "distribution_agreements.creator_id")
      .where("assets.id", "=", assetId)
      .selectAll()
      .executeTakeFirst();

    const creatorSplit = agreement ? Number(agreement.royalty_split_creator) / 100 : 1.0;
    const platformSplit = agreement ? Number(agreement.royalty_split_platform) / 100 : 0.0;

    const creatorShare = gross * creatorSplit;
    const platformShare = gross * platformSplit;

    await db.insertInto("royalty_ledger").values({
      id: db.uuid(),
      asset_id: assetId,
      period_start: params.periodStart,
      period_end: params.periodEnd,
      source: row.platform,
      total_plays: totalPlays,
      gross_revenue_usd: gross,
      creator_share_usd: creatorShare,
      platform_share_usd: platformShare
    });
  }
}
