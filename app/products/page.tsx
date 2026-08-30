import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsContent from '@/components/ProductsContent';
import { getAllProducts } from '@/lib/products';
import { getUser } from '@/lib/auth/getUser';
import { getFavoriteProductIds } from '@/lib/favorites';

export default async function ProductsPage() {
    const [products, user, favoriteIds] = await Promise.all([
        getAllProducts(),
        getUser(),
        getFavoriteProductIds(),
    ]);

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Header user={user} />
            <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
                <ProductsContent products={products} user={user} favoriteIds={favoriteIds} />
            </section>
            <Footer />
        </main>
    );
}
