import { prisma } from '@/lib/prisma';

export default async function Sku() {
    const product = await prisma.product.findUnique({
        where: {
            sku: 'MOT-SCO-SCO-116',
        },
    });

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <main>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <p>{product.price.toString()} €</p>
        </main>
    );
}