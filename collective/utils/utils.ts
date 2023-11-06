import { sqlGetMaxSn } from "./queries";

export const generateId = (chain: string, collection: string, sn: number): string => {
	return `${chain}-${collection}-${sn}`;
};


export const nextSn = async (db: D1Database) => {
	const maxSnResult = (await db.prepare(sqlGetMaxSn).all()).results;
	const maxSn = (maxSnResult[0]?.maxSn as number) || 0;
	return maxSn + 1;
};
