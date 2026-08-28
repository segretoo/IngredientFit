import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import { getFavorites } from "@/lib/favorites";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MyPageFavorites from "./MyPageFavorites";
import MyPageSkinProfile from "./MyPageSkinProfile";
import MyPageAccountSettings from "./MyPageAccountSettings";

export const metadata: Metadata = {
  title: "마이페이지 | 성분핏",
};

// 로그인 필수 페이지. 비로그인 상태로 들어오면 로그인 후 여기로 돌아오도록 유도
export default async function MyPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login?redirect=/mypage");
  }

  const favorites = await getFavorites();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header user={user} />
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <h1 className="text-[22px] font-bold text-[var(--color-ink)]">마이페이지</h1>
        <p className="mt-1.5 text-[13px] text-[var(--color-ink-faint)]">{user.email}</p>

        <div className="mt-8 space-y-10">
          <MyPageAccountSettings user={user} />
          <MyPageSkinProfile />
          <MyPageFavorites favorites={favorites} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
