import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsContent from '@/components/ProductsContent';
import { getAllProducts } from '@/lib/products';
import { getUser } from '@/lib/auth/getUser';

export default async function ProductsPage() {
    const [products, user] = await Promise.all([getAllProducts(), getUser()]);

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Header user={user} />
            <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
                <ProductsContent products={products} />
            </section>
            <Footer />
        </main>
    );
}
