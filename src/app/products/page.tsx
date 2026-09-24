import ProductFilters from "@/components/product-filters";
import { getProducts } from "@/lib/products";

type ProductsPageProps = {
    searchParams: Promise<{
        search?: string;
        category?: string;
        sort?: string;
    }>;
};

export default async function ProductsPage({
                                               searchParams,
                                           }: ProductsPageProps) {
    const params = await searchParams;

    const search = params.search ?? "";
    const category = params.category ?? "";

    const validSorts = [
        "newest",
        "oldest",
        "price-asc",
        "price-desc",
        "title-asc",
        "title-desc",
    ] as const;

    const sort = validSorts.includes(
        params.sort as (typeof validSorts)[number]
    )
        ? (params.sort as (typeof validSorts)[number])
        : "newest";

    const products = await getProducts({
        search,
        category,
        sort,
    });

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">

            {/* Filters */}
            <aside>
            <ProductFilters />
            </aside>

    {/* Products */}
    <section>
        <div className="mb-6">
    <h1 className="text-2xl font-bold">
        Products
        </h1>

    {search && (
        <p className="mt-2 text-gray-600">
            Search results for &#34;{search}&#34;
                               </p>
    )}
    </div>

    {products.length === 0 ? (
        <div className="py-20 text-center">
        <p className="text-gray-500">
            No products found.
    </p>
    </div>
    ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
                    <article
                        key={product.id}
                className="border border-gray-200 p-5"
                >
                <h2 className="font-semibold">
                    {product.title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                    {product.category}
                    </p>

                    <p className="mt-4 font-medium">
                        ${product.price.toFixed(2)}
        </p>
        </article>
    ))}
        </div>
    )}
    </section>

    </div>
    </main>
);
}