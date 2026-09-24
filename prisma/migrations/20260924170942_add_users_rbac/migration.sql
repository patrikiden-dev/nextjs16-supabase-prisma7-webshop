/*
  Warnings:

  - You are about to drop the column `search_vector` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_search_vector_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "search_vector";
