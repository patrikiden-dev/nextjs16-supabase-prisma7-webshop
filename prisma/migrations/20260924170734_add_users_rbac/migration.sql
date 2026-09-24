/*
  Warnings:

  - You are about to drop the column `search_vector` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropIndex
DROP INDEX "products_search_vector_idx";

-- DropIndex
DROP INDEX "users_name_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "search_vector";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "bio",
DROP COLUMN "isAdmin",
DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
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
