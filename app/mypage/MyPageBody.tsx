import type { AuthUser } from "@/lib/auth/getUser";
import type { FavoriteProduct } from "@/lib/favorites";
import type { RecommendationHistoryItem } from "@/lib/recommendationHistory";
import type { SkinProfile } from "@/lib/skinProfile";
import MyPageProfileCard from "./MyPageProfileCard";
import MyPageSkinProfile from "./MyPageSkinProfile";
import MyPageFavorites from "./MyPageFavorites";
import MyPageRecommendationHistory from "./MyPageRecommendationHistory";

interface Props {
  user: AuthUser;
  favorites: FavoriteProduct[];
  recommendationHistory: RecommendationHistoryItem[];
  skinProfile: SkinProfile | null;
}

// 데스크톱(app/mypage/page.tsx)과 모바일(app/mobile/mypage/page.tsx)이 공유하는
// 순수 콘텐츠. Header/Footer는 각 페이지가 자기 상황에 맞게 따로 감쌈 —
// 데스크톱은 Header+Footer, 모바일은 MobileLayout이 이미 헤더를 제공하니 여기선 안 씀
export default function MyPageBody({ user, favorites, recommendationHistory, skinProfile }: Props) {
  return (
    <>
      <h1 className="text-[22px] font-bold text-[var(--color-ink)]">마이페이지</h1>

      <div className="mt-8 space-y-6">
        {/* 프로필 + 피부 타입: 둘 다 "내 정보" 성격이라 나란히 배치 */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <MyPageProfileCard user={user} />
          <MyPageSkinProfile skinProfile={skinProfile} />
        </div>

        <MyPageFavorites favorites={favorites} />
        <MyPageRecommendationHistory history={recommendationHistory} />
      </div>
    </>
  );
}
