import { db } from "../db/index.js";
import { v4 as uuid } from "uuid";

export async function calculateRoyaltiesForPeriod(params) {
  const ratePerPlayUsd = 0.01;

  const internalRows = await db.any(
    `SELECT a.id AS asset_id,
            COUNT(p.id) AS total_plays
     FROM assets a
     JOIN asset_plays p ON p.asset_id = a.id
     WHERE p.created_at::date BETWEEN $1 AND $2
     GROUP BY a.id`,
    [params.periodStart, params.periodEnd]
  );

  for (const row of internalRows) {
    const assetId = row.asset_id;
    const totalPlays = Number(row.total_plays);
    const gross = totalPlays * ratePerPlayUsd;

    const agreement = await db.oneOrNone(
      `SELECT da.*
       FROM assets a
       JOIN distribution_agreements da
         ON da.creator_id = a.creator_id
       WHERE a.id = $1
       LIMIT 1`,
      [assetId]
    );

    const creatorSplit = agreement
      ? Number(agreement.royalty_split_creator) / 100
      : 1.0;
    const platformSplit = agreement
      ? Number(agreement.royalty_split_platform) / 100
      : 0.0;

    const creatorShare = gross * creatorSplit;
    const platformShare = gross * platformSplit;

    await db.none(
      `INSERT INTO royalty_ledger (
        id, asset_id, period_start, period_end, source,
        total_plays, gross_revenue_usd,
        creator_share_usd, platform_share_usd
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )`,
      [
        uuid(),
        assetId,
        params.periodStart,
        params.periodEnd,
        "internal",
        totalPlays,
        gross,
        creatorShare,
        platformShare
      ]
    );
  }

  const platformRows = await db.any(
    `SELECT asset_id, platform,
            SUM(total_plays) AS total_plays,
            SUM(total_revenue_usd) AS total_revenue_usd
     FROM platform_revenue_reports
     WHERE period_start >= $1 AND period_end <= $2
     GROUP BY asset_id, platform`,
    [params.periodStart, params.periodEnd]
  );

  for (const row of platformRows) {
    const assetId = row.asset_id;
    const totalPlays = Number(row.total_plays);
    const gross = Number(row.total_revenue_usd);

    const agreement = await db.oneOrNone(
      `SELECT da.*
       FROM assets a
       JOIN distribution_agreements da
         ON da.creator_id = a.creator_id
       WHERE a.id = $1
       LIMIT 1`,
      [assetId]
    );

    const creatorSplit = agreement
      ? Number(agreement.royalty_split_creator) / 100
      : 1.0;
    const platformSplit = agreement
      ? Number(agreement.royalty_split_platform) / 100
      : 0.0;

    const creatorShare = gross * creatorSplit;
    const platformShare = gross * platformSplit;

    await db.none(
      `INSERT INTO royalty_ledger (
        id, asset_id, period_start, period_end, source,
        total_plays, gross_revenue_usd,
        creator_share_usd, platform_share_usd
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )`,
      [
        uuid(),
        assetId,
        params.periodStart,
        params.periodEnd,
        row.platform,
        totalPlays,
        gross,
        creatorShare,
        platformShare
      ]
    );
  }
}
