CREATE TABLE accounts
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
    FOREIGN KEY (social_id) REFERENCES socials (id)
    FOREIGN KEY (referrer) REFERENCES accounts (id)
);

CREATE TABLE socials
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



CREATE INDEX IDX_account_handle ON accounts (handle);

