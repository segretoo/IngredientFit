import Header from "@/components/Header";
import { getUser } from "@/lib/auth/getUser";
import TermsContent from "@/components/TermsContent";
import Footer from "@/components/Footer";

export default async function TermsPage() {
  const user = await getUser();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header user={user} />
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-[22px] font-bold text-[var(--color-ink)]">이용약관</h1>
          <p className="mt-1.5 text-[13px] text-[var(--color-ink-faint)]">
            프로토타입 버전 안내 사항이에요.
          </p>
          <div className="mt-8">
            <TermsContent />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
