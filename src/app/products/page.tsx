// src/app/products/page.tsx

import { getProducts, ProductSort } from "@/lib/products";
import ProductFilters from "@/components/product-filters";
import Pagination from "@/components/pagination";

type ProductsPageProps = {
    searchParams: Promise<{
        search?: string;
        category?: string;
        sort?: string;
        page?: string;
    }>;
};

const validSorts: ProductSort[] = [
    "newest",
    "oldest",
    "price-asc",
    "price-desc",
    "title-asc",
    "title-desc",
];

export default async function ProductsPage({
                                               searchParams,
                                           }: ProductsPageProps) {
    const params = await searchParams;

    const search = params.search ?? "";
    const category = params.category ?? "";

    const sort: ProductSort = validSorts.includes(
        params.sort as ProductSort
    )
        ? (params.sort as ProductSort)
        : "newest";

    const page = Math.max(
        1,
        Number.parseInt(params.page ?? "1", 10) || 1
    );

    const result = await getProducts({
        search,
        category,
        sort,
        page,
        pageSize: 12,
    });

    return (
        <main>
            <ProductFilters />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.products.map((product) => (
                    <article key={product.id}>
                        <h2>{product.title}</h2>

                        <p>
                            ${product.price.toFixed(2)}
                        </p>
                    </article>
                ))}
            </div>

            <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
            />
        </main>
    );
}