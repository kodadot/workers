CREATE TABLE collections
(
    ID        TEXT PRIMARY KEY NOT NULL,
    NAME      TEXT,
    IMAGE     TEXT,
    MEDIA_URL TEXT,
    METADATA  TEXT,
    CHAIN     CHAR(10),
    VOLUME    UNSIGNED BIG INT
);

CREATE TABLE items
(
    ID              TEXT PRIMARY KEY NOT NULL,
    NAME            TEXT,
    IMAGE           TEXT,
    MEDIA_URL       TEXT,
    METADATA        TEXT,
    COLLECTION_ID   TEXT,
    COLLECTION_NAME TEXT,
    CHAIN           CHAR(10),
    FOREIGN KEY (COLLECTION_ID) REFERENCES collections (ID)

);