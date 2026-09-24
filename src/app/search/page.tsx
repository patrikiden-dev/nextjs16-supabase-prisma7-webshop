import { prisma } from '@/lib/prisma';
import {Product} from "@/types/product";


/**
 * Primsa Full Text Search are not suppoerted in Prisma, so we must use raw Query
 * @constructor
 */
export default async function Search() {

    // Example of search string that must contain both keywords: iphone and case
    const search = "iphone case";
    /**
     * keyword and tsQuery make it possible to search for multiple keywords
     */
    const keywords = search
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    // Make "iphone case" to iphone & case in search_vector
    const tsQuery = keywords.join(" & ");

    /**
     * Prisma query to search for products using the tsQuery
     */
    const products = await prisma.$queryRaw<Product[]>`
        SELECT
            id,
            slug,
            title,
            description,
            price,
            category,
            stock,
            brand,
            sku,
            "createdAt",
            "updatedAt"
        FROM "products"
        WHERE "search_vector" @@ websearch_to_tsquery('english', ${tsQuery})
        ORDER BY ts_rank(
            "search_vector",
            websearch_to_tsquery('english', ${tsQuery})
            ) DESC;
    `;

    if (!products) {
        return <div>No products were found!</div>;
    }

    return (
        <>
            <h1>Product Search:</h1>
            {products.map((product: Product) => (
                    <h2 key={product.id}>
                        {product.title} - {product.slug}
                    </h2>
                ))}
        </>
    );

}
/*


    const products = await prisma.$queryRaw<Product[]>`
        SELECT id, title, description, brand, category, slug, search_vector::text AS search_vector
        FROM "products"
        WHERE "search_vector" @@ websearch_to_tsquery('english', ${search})
        ORDER BY ts_rank("search_vector", websearch_to_tsquery('english', ${search})) DESC
    `;


const products = await prisma.$queryRaw`
  SELECT *
  FROM "products"
  WHERE "search_vector" @@ websearch_to_tsquery('english', ${search})
  ORDER BY ts_rank("search_vector", websearch_to_tsquery('english', ${search})) DESC
`;
*/