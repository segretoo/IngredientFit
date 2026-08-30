import ProductsContent from '@/components/ProductsContent';
import { getAllProducts } from '@/lib/products';
import { getUser } from '@/lib/auth/getUser';
import { getFavoriteProductIds } from '@/lib/favorites';

export default async function MobileProductsPage() {
    const [products, user, favoriteIds] = await Promise.all([
        getAllProducts(),
        getUser(),
        getFavoriteProductIds(),
    ]);

    return (
        <main className="px-5 py-8">
            <ProductsContent compact products={products} user={user} favoriteIds={favoriteIds} />
        </main>
    );
}
