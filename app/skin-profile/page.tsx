import Header from "@/components/Header";
import { getUser } from "@/lib/auth/getUser";
import Footer from "@/components/Footer";
import SkinProfileContent from "@/components/SkinProfileContent";

export default async function SkinProfilePage() {
  const user = await getUser();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header user={user} />
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <div className="mx-auto max-w-md">
          <SkinProfileContent />
        </div>
      </section>
      <Footer />
    </main>
  );
}
