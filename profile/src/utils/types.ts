import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Accounts {
  id: string;
  handle: string | null;
  name: string | null;
  avatar: string | null;
  referral: string | null;
  checksum: string | null;
  banner: string | null;
  social_id: string | null;
  referrer: string | null;
}

export interface CompletedQuests {
  account_id: string;
  quest_id: string;
  completed_at: Generated<number>;
  paid: string | null;
}

export interface Followers {
  id: Generated<number>;
  account_id: string;
  follower_id: string;
  created_at: Generated<string | null>;
}

export interface Quests {
  id: string;
  name: string;
  description: string;
  image: string;
  reward: number;
  type: string | null;
}

export interface Socials {
  id: string;
  web: string | null;
  email: string | null;
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  discord: string | null;
  telegram: string | null;
  medium: string | null;
}

export interface Statistics {
  id: string;
  account_id: string;
  rank: number | null;
  total_referrals: Generated<number>;
  completed_referrals: Generated<number>;
  quests: Generated<number>;
  created_at: Generated<number>;
}

export interface DB {
  accounts: Accounts;
  completed_quests: CompletedQuests;
  followers: Followers;
  quests: Quests;
  socials: Socials;
  statistics: Statistics;
}
