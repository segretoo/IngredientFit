import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import { getFavorites } from "@/lib/favorites";
import { getRecommendationHistory } from "@/lib/recommendationHistory";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MyPageProfileCard from "./MyPageProfileCard";
import MyPageSkinProfile from "./MyPageSkinProfile";
import MyPageFavorites from "./MyPageFavorites";
import MyPageRecommendationHistory from "./MyPageRecommendationHistory";

export const metadata: Metadata = {
  title: "마이페이지 | 성분핏",
};

// 로그인 필수 페이지. 비로그인 상태로 들어오면 로그인 후 여기로 돌아오도록 유도
export default async function MyPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login?redirect=/mypage");
  }

  const [favorites, recommendationHistory] = await Promise.all([
    getFavorites(),
    getRecommendationHistory(),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header user={user} />
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <h1 className="text-[22px] font-bold text-[var(--color-ink)]">마이페이지</h1>

        <div className="mt-8 space-y-6">
          {/* 프로필 + 피부 타입: 둘 다 "내 정보" 성격이라 나란히 배치 */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            <MyPageProfileCard user={user} />
            <MyPageSkinProfile />
          </div>

          <MyPageFavorites favorites={favorites} />
          <MyPageRecommendationHistory history={recommendationHistory} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
