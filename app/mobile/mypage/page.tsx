import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser";
import { getFavorites } from "@/lib/favorites";
import { getRecommendationHistory } from "@/lib/recommendationHistory";
import { getSkinProfileFromAccount } from "@/lib/skinProfileDb";
import MyPageBody from "@/app/mypage/MyPageBody";

export const metadata: Metadata = {
  title: "마이페이지 | 성분핏",
};

// 데스크톱 app/mypage/page.tsx와 동일 로직, Header/Footer만 없음
export default async function MobileMyPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login?redirect=/mypage");
  }

  const [favorites, recommendationHistory, skinProfile] = await Promise.all([
    getFavorites(),
    getRecommendationHistory(),
    getSkinProfileFromAccount(),
  ]);

  return (
    <div className="px-5 py-8">
      <MyPageBody
        user={user}
        favorites={favorites}
        recommendationHistory={recommendationHistory}
        skinProfile={skinProfile}
      />
    </div>
  );
}
