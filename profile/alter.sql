ALTER TABLE collections ADD COLUMN `collection_id` TEXT NOT NULL DEFAULT '';
UPDATE collections SET collection_id = id;
UPDATE collections SET id = chain || '-' || id WHERE collection_id = id;