import { prisma } from '@/lib/prisma';
import Image from 'next/image'

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({
                                              params,
                                          }: ProductPageProps) {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: {
            slug,
        },
    });

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <main className="p-8">
        <h1 className="text-3xl font-bold">
            {product.title}
            </h1>

            <p className="mt-4">
        {product.description}
        </p>

        <p className="mt-4">
        Price: {product.price.toString()} €
    </p>

    <p>
    Category: {product.category}
    </p>

    <p>
    Brand: {product.brand ?? 'No brand'}
    </p>

    <p>
    Stock: {product.stock}
    </p>

    <p>
    SKU: {product.sku}
    </p>
    <p>
        Image:
        <Image
            src={`/images/${product.slug}.webp`}
            width={500}
            height={500}
            alt={`${product.title}`}
            loading="eager"
        />
    </p>
    <p>
        <Image
            src={`/thumbnails/${product.slug}.webp`}
            width={50}
            height={50}
            alt={`${product.title}`}
        />
    </p>
    </main>
);
}