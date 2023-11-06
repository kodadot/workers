CREATE TABLE collective_items (
    id         TEXT PRIMARY KEY NOT NULL,
    chain      TEXT NOT NULL,
    collection TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issuer     TEXT NOT NULL,
    metadata   TEXT NOT NULL,
    sn         INTEGER NOT NULL UNIQUE,
    signature  TEXT NOT NULL,
    approved   INTEGER DEFAULT 0,
    mail       TEXT,
    hash       TEXT
)
