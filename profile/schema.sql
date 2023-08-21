CREATE TABLE IF NOT EXISTS accounts
(
    id        TEXT PRIMARY KEY NOT NULL,
    handle    CHAR(15) UNIQUE,
    name      TEXT,
    avatar    TEXT,
    referral  TEXT UNIQUE,
    checksum  TEXT,
    banner    TEXT,
    social_id TEXT,
    referrer   TEXT,
    FOREIGN KEY (social_id) REFERENCES socials (id),
    FOREIGN KEY (referrer) REFERENCES accounts (id)
);

CREATE TABLE IF NOT EXISTS socials
(
    id              TEXT PRIMARY KEY NOT NULL,
    web       TEXT,
    email     TEXT,
    twitter   TEXT,
    instagram TEXT,
    facebook  TEXT,
    tiktok    TEXT,
    youtube   TEXT,
    discord   TEXT,
    telegram  TEXT,
    medium    TEXT
);


CREATE TABLE IF NOT EXISTS accounts
(
    id        TEXT PRIMARY KEY NOT NULL,
    handle    CHAR(15) UNIQUE,
    name      TEXT,
    avatar    TEXT,
    referral  TEXT UNIQUE,
    checksum  TEXT,
    banner    TEXT,
    social_id TEXT,
    referrer   TEXT,
    FOREIGN KEY (social_id) REFERENCES socials (id),
    FOREIGN KEY (referrer) REFERENCES accounts (id)
);

CREATE TABLE IF NOT EXISTS quests
(
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    image       TEXT NOT NULL,
    reward      NUMERIC NOT NULL,
    type        TEXT,
    link        TEXT 
    -- link should tell where to go to complete the quest
);

CREATE TABLE IF NOT EXISTS completed_quests
(
    account_id TEXT NOT NULL,
    quest_id   TEXT NOT NULL,
    completed_at NUMERIC NOT NULL DEFAULT (strftime('%s', 'now')),
    paid       TEXT,
    PRIMARY KEY (account_id, quest_id),
    FOREIGN KEY (account_id) REFERENCES accounts (id),
    FOREIGN KEY (quest_id) REFERENCES quests (id)
);

CREATE TABLE IF NOT EXISTS statistics
(
    id         TEXT PRIMARY KEY NOT NULL,
    account_id TEXT NOT NULL,
    rank      NUMERIC,
    total_referrals    NUMERIC NOT NULL DEFAULT 0,
    completed_referrals NUMERIC NOT NULL DEFAULT 0,
    quests   NUMERIC NOT NULL DEFAULT 0,
    created_at NUMERIC NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);



CREATE UNIQUE INDEX IF NOT EXISTS IDX_account_handle ON accounts (handle);

