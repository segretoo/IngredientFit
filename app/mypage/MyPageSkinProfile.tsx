import Link from "next/link";
import { skinTypeLabel, type SkinProfile } from "@/lib/skinProfile";
import MyPageSectionCard from "@/components/mypage/MyPageSectionCard";
import ArrowRightIcon from "@/components/ArrowRightIcon";

interface Props {
  skinProfile: SkinProfile | null;
}

// baseType + sensitive 조합별 한 줄 설명. skinTypeLabel(타입명)이랑 별개로
// "이게 무슨 의미인지" 감 잡게 해주는 보조 문구
function skinTypeDescription(profile: SkinProfile): string {
  const baseDescription =
    profile.baseType === "dry"
      ? "수분이 부족해 당기기 쉬운 피부예요."
      : profile.baseType === "oily"
        ? "유분기가 많아 번들거리기 쉬운 피부예요."
        : "유분과 수분 밸런스가 무너지기 쉬운 피부예요.";
  return profile.sensitive ? `${baseDescription} 자극에도 예민한 편이에요.` : baseDescription;
}

// 마이페이지는 항상 로그인된 상태에서만 보이는 화면이라, 부모(app/mypage/page.tsx)가
// getSkinProfileFromAccount()로 DB에서 직접 읽어 내려줌 — localStorage 안 읽음
// (기기 바꿔서 들어와도 계정 값이 정확히 보여야 하니까). 상태 없는 순수 표시라
// 클라이언트 컴포넌트로 안 만들어도 됨
export default function MyPageSkinProfile({ skinProfile }: Props) {
  return (
    <MyPageSectionCard title="피부 타입">
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-[20px] font-bold leading-snug text-[var(--color-ink)]">
            {skinProfile ? skinTypeLabel(skinProfile) : "아직 진단 전이에요"}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-faint)]">
            {skinProfile
              ? skinTypeDescription(skinProfile)
              : "몇 가지 질문에 답하면 내 피부에 맞는 성분을 우선 추천해드려요."}
          </p>
        </div>

        <Link
          href="/skin-profile"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border-[1.5px] border-[var(--color-primary)] px-4 py-2 text-[12.5px] font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)]"
        >
          {skinProfile ? "피부 타입 재진단하기" : "지금 진단하러 가기"}
          <ArrowRightIcon />
        </Link>
      </div>
    </MyPageSectionCard>
  );
}
