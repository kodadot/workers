CREATE TABLE watchlist (
    id           INTEGER      PRIMARY KEY AUTOINCREMENT NOT NULL,
    auth_address TEXT         NOT NULL,
    chain        CHAR(10)     NOT NULL,
    entity_type  CHAR(10)     NOT NULL,
    entity_id    TEXT         NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
