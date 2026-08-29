"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { skinTypeLabel, type SkinProfile } from "@/lib/skinProfile";
import MyPageSectionCard from "@/components/mypage/MyPageSectionCard";
import ArrowRightIcon from "@/components/ArrowRightIcon";

const initialSkinProfile: SkinProfile | null = null;

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

// 피부 진단(질문형, /skin-profile)은 아직 localStorage 기반이라 계정에는 안 남음.
// 즐겨찾기처럼 DB 연동은 다음 단계 — 지금은 "ingredientfit:skinProfile" 키
// (components/chat/ChatWindow.tsx가 쓰는 것과 동일)에 저장된 값을 그대로 보여줌
export default function MyPageSkinProfile() {
  const [skinProfile, , hydrated] = useLocalStorage<SkinProfile | null>(
    "ingredientfit:skinProfile",
    initialSkinProfile
  );

  const hasProfile = hydrated && skinProfile;

  return (
    <MyPageSectionCard title="피부 타입">
      <div className="flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-[20px] font-bold leading-snug text-[var(--color-ink)]">
            {hasProfile ? skinTypeLabel(skinProfile) : "아직 진단 전이에요"}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-faint)]">
            {hasProfile
              ? skinTypeDescription(skinProfile)
              : "몇 가지 질문에 답하면 내 피부에 맞는 성분을 우선 추천해드려요."}
          </p>
        </div>

        <Link
          href="/skin-profile"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border-[1.5px] border-[var(--color-primary)] px-4 py-2 text-[12.5px] font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)]"
        >
          {hasProfile ? "피부 타입 재진단하기" : "지금 진단하러 가기"}
          <ArrowRightIcon />
        </Link>
      </div>
    </MyPageSectionCard>
  );
}
