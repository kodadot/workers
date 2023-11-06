import { CollectiveItemData } from "../src/types";
import { D1Database, D1PreparedStatement } from "@cloudflare/workers-types";

export const sqlGetMaxSn = `SELECT MAX(sn) as maxSn FROM collective_items`;

export const insertCollectiveItem = (
  db: D1Database,
  data: CollectiveItemData
): D1PreparedStatement => {
  return db
    .prepare(
      `INSERT INTO collective_items (id, chain, collection, issuer, metadata, sn, signature, mail)
	   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.chain,
      data.collection,
      data.issuer,
      data.metadata,
      data.sn,
      data.signature,
      data.mail
    );
};
