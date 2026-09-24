import { prisma } from "@/lib/prisma";

export type ProductSort =
    | "newest"
    | "oldest"
    | "price-asc"
    | "price-desc"
    | "title-asc"
    | "title-desc";

export type ProductResult = {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    brand: string | null;
    sku: string;
    createdAt: Date;
    updatedAt: Date;
};

function buildTsQuery(search: string): string {
    return search
        .trim()
        .split(/\s+/)
        .map((word) =>
            word.replace(/[^\p{L}\p{N}_-]/gu, "")
        )
        .filter(Boolean)
        .join(" & ");
}

export async function getProducts({
                                      search = "",
                                      category = "",
                                      sort = "newest",
                                  }: {
    search?: string;
    category?: string;
    sort?: ProductSort;
}): Promise<ProductResult[]> {
    const tsQuery = buildTsQuery(search);

    const cleanCategory = category.trim();

    /*
     * SEARCH + CATEGORY
     */
    if (tsQuery && cleanCategory) {
        switch (sort) {
            case "price-asc":
                return prisma.$queryRaw<ProductResult[]>`
          SELECT
            "id",
            "slug",
            "title",
            "description",
            "price"::float8 AS "price",
            "category",
            "stock",
            "brand",
            "sku",
            "createdAt",
            "updatedAt"
          FROM "products"
          WHERE
            "search_vector" @@ to_tsquery('english', ${tsQuery})
            AND LOWER(TRIM("category")) = LOWER(TRIM(${cleanCategory}))
          ORDER BY "price" ASC
        `;

            case "price-desc":
                return prisma.$queryRaw<ProductResult[]>`
          SELECT
            "id",
            "slug",
            "title",
            "description",
            "price"::float8 AS "price",
            "category",
            "stock",
            "brand",
            "sku",
            "createdAt",
            "updatedAt"
          FROM "products"
          WHERE
            "search_vector" @@ to_tsquery('english', ${tsQuery})
            AND LOWER(TRIM("category")) = LOWER(TRIM(${cleanCategory}))
          ORDER BY "price" DESC
        `;

            case "title-asc":
                return prisma.$queryRaw<ProductResult[]>`
          SELECT
            "id",
            "slug",
            "title",
            "description",
            "price"::float8 AS "price",
            "category",
            "stock",
            "brand",
            "sku",
            "createdAt",
            "updatedAt"
          FROM "products"
          WHERE
            "search_vector" @@ to_tsquery('english', ${tsQuery})
            AND LOWER(TRIM("category")) = LOWER(TRIM(${cleanCategory}))
          ORDER BY "title" ASC
        `;

            case "title-desc":
                return prisma.$queryRaw<ProductResult[]>`
          SELECT
            "id",
            "slug",
            "title",
            "description",
            "price"::float8 AS "price",
            "category",
            "stock",
            "brand",
            "sku",
            "createdAt",
            "updatedAt"
          FROM "products"
          WHERE
            "search_vector" @@ to_tsquery('english', ${tsQuery})
            AND LOWER(TRIM("category")) = LOWER(TRIM(${cleanCategory}))
          ORDER BY "title" DESC
        `;

            case "oldest":
                return prisma.$queryRaw<ProductResult[]>`
          SELECT
            "id",
            "slug",
            "title",
            "description",
            "price"::float8 AS "price",
            "category",
            "stock",
            "brand",
            "sku",
            "createdAt",
            "updatedAt"
          FROM "products"
          WHERE
            "search_vector" @@ to_tsquery('english', ${tsQuery})
            AND LOWER(TRIM("category")) = LOWER(TRIM(${cleanCategory}))
          ORDER BY "createdAt" ASC
        `;

            case "newest":
            default:
                return prisma.$queryRaw<ProductResult[]>`
          SELECT
            "id",
            "slug",
            "title",
            "description",
            "price"::float8 AS "price",
            "category",
            "stock",
            "brand",
            "sku",
            "createdAt",
            "updatedAt"
          FROM "products"
          WHERE
            "search_vector" @@ to_tsquery('english', ${tsQuery})
            AND "category" = ${cleanCategory}
          ORDER BY "createdAt" DESC
        `;
        }
    }

    /*
     * SEARCH ONLY
     */
    if (tsQuery) {
        return prisma.$queryRaw<ProductResult[]>`
      SELECT
        "id",
        "slug",
        "title",
        "description",
        "price"::float8 AS "price",
        "category",
        "stock",
        "brand",
        "sku",
        "createdAt",
        "updatedAt"
      FROM "products"
      WHERE
        "search_vector" @@ to_tsquery('english', ${tsQuery})
      ORDER BY "createdAt" DESC
    `;
    }

    /*
     * CATEGORY ONLY
     */
    if (cleanCategory) {
        return prisma.$queryRaw<ProductResult[]>`
      SELECT
        "id",
        "slug",
        "title",
        "description",
        "price"::float8 AS "price",
        "category",
        "stock",
        "brand",
        "sku",
        "createdAt",
        "updatedAt"
      FROM "products"
      WHERE "category" = ${cleanCategory}
      ORDER BY "createdAt" DESC
    `;
    }

    /*
     * NO FILTERS
     */
    return prisma.$queryRaw<ProductResult[]>`
    SELECT
      "id",
      "slug",
      "title",
      "description",
      "price"::float8 AS "price",
      "category",
      "stock",
      "brand",
      "sku",
      "createdAt",
      "updatedAt"
    FROM "products"
    ORDER BY "createdAt" DESC
  `;
}