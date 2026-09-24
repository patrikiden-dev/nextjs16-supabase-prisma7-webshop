/*
  Warnings:

  - You are about to drop the column `search_vector` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_search_vector_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "search_vector";

ALTER TABLE "products"
    ADD COLUMN "search_vector" tsvector
        GENERATED ALWAYS AS (
            setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
            setweight(to_tsvector('english', coalesce("description", '')), 'B') ||
            setweight(to_tsvector('english', coalesce("category", '')), 'C') ||
            setweight(to_tsvector('english', coalesce("brand", '')), 'C')
            ) STORED;

CREATE INDEX "products_search_vector_idx"
    ON "products"
    USING GIN ("search_vector");