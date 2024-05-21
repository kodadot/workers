CREATE TABLE collections
(
    id        TEXT PRIMARY KEY NOT NULL,
    name      TEXT,
    image     TEXT,
    media_url TEXT,
    metadata  TEXT,
    chain     CHAR(10),
    collection_id TEXT NOT NULL,
    volume    UNSIGNED BIG INT
);

CREATE TABLE items
(
    id              TEXT PRIMARY KEY NOT NULL,
    name            TEXT,
    image           TEXT,
    media_url       TEXT,
    metadata        TEXT,
    collection_id   TEXT,
    collection_name TEXT,
    chain           CHAR(10),
    item_id         TEXT NOT NULL,
    FOREIGN KEY (collection_id) REFERENCES collections (id)
);

CREATE INDEX IDX_collection_name ON collections (name);

